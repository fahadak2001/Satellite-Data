var image = ee.ImageCollection("COPERNICUS/S2_HARMONIZED"); //selected sat image
var classNames = Urban.merge(vegetation).merge(barrenland).merge(water_bodies); //merged classification

var roi = table; // table has the boundry poinsts of sindh

//legend add
   
    var legendColors = ['4CAF50', 'CD853F', '00BCD4', '757575'];
    var legendLabels = ['Vegetation', 'Barren Land', 'Water Bodies', 'Urban Land'];
    
    var legendPanel = ui.Panel({
      style: {
        position: 'bottom-right',
        padding: '8px 15px'
      }
    });
    
    var legendTitle = ui.Label({
      value: 'Legend',
      style: {
        fontWeight: 'bold',
        fontSize: '18px',
        margin: '0 0 4px 0',
        padding: '0'
      }
    });
    
    legendPanel.add(legendTitle);
    
    for (var i = 0; i < legendColors.length; i++) {
      var color = legendColors[i];
      var label = legendLabels[i];
      
      var legendItem = ui.Panel({
        widgets: [
          ui.Label({
            style: {
              backgroundColor: '#' + color,
              padding: '8px',
              margin: '0 8px 0 0'
            }
          }),
          ui.Label({
            value: label
          })
        ],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
      
      legendPanel.add(legendItem);
    }
    
    Map.add(legendPanel);

var startYear = 2022;
var endYear = 2022;
//loop to add images automatically
for (var year = startYear; year <= endYear; year++) {
  for (var month = 6; month <= 9; month++) {
    var startDate = ee.Date.fromYMD(year, month, 1);
    var endDate = ee.Date.fromYMD(year, month, 30);
    
    var monthFilter = ee.Filter.date(startDate, endDate);
    print(monthFilter);
    
    var filteredCollection = image.filter(monthFilter)
      .filter(ee.Filter.bounds(roi)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1)); // Filter out cloudy pixels

    
    var median = filteredCollection.median();
    
    print(filteredCollection.size());
    
    var clipped = median.clip(roi);
      
    var bandNames = ["B4", "B3", "B2"]; // Specify the band names of interest
   
    var visParamsTrue = {bands: ['B4', 'B3', 'B2'], min: 1500, max: 8000, gamma: 1.1};
    Map.addLayer(clipped, visParamsTrue, "Sentinel 2022 month =" + month);
    Map.centerObject(roi, 8);
    
    var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
    
    var training = clipped.select(bands).sampleRegions({
      collection: classNames,
      properties: ['landcover'],
      scale: 30,
      tileScale: 16,
      geometries: true
    }).randomColumn();
    
    var trainingSize = training.size();
    var trainingThreshold = trainingSize.multiply(0.7);
    
    var trainingDataset = training.filter(ee.Filter.lt('random', 0.7));
    var validationDataset = training.filter(ee.Filter.gte('random', 0.7));
    
    var classifier = ee.Classifier.smileCart().train({
      features: trainingDataset,
      classProperty: 'landcover',
      inputProperties: bands
    });
    
    var classified = clipped.select(bands).classify(classifier);
    
    // Display classification
    Map.centerObject(classNames, 11);
    var classvis = { min: 0, max: 3, palette: ['4CAF50', 'CD853F', '00BCD4', '757575'] }
    Map.addLayer(classified, classvis , 'classification of month' + month);
    //Medium Green,Peru,Cyan,Gray
    
    var vclassified = classified.visualize(classvis);
    
    // Accuracy assessment
    var validation = validationDataset.classify(classifier);
    var testAccuracy = validation.errorMatrix('landcover', 'classification');
    print('Confusion Matrix:', testAccuracy);
    print('Overall Accuracy:', testAccuracy.accuracy());
    print('User Accuracy:', testAccuracy.consumersAccuracy());
    print('Producer Accuracy:', testAccuracy.producersAccuracy());
    
    // Export the merged image to Google Drive
    Export.image.toDrive({
      image: classified,
      description: 'new' + month,
      folder: 'earthengine',
      fileNamePrefix: 'classified_with_legend' + month,
      region: table,
      scale: 10,
      maxPixels: 3e9
});


}

}


//coordinates of classification points for training below:-

/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/ee-thesisfloodassessment/assets/sindhsh"),
    geometry = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[68.74536590193443, 27.531214108419523],
          [68.74536590193443, 27.51812221147424],
          [68.765278621661, 27.51812221147424],
          [68.765278621661, 27.531214108419523]]], null, false),
    vegetation = 
    /* color: #22c223 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([68.74798632000577, 27.525430696474263]),
            {
              "landcover": 1,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([68.75927305554043, 27.52284275084017]),
            {
              "landcover": 1,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7269940637721, 27.51523526642726]),
            {
              "landcover": 1,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([68.74927951885624, 27.506707191205557]),
            {
              "landcover": 1,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7518115241663, 27.50339556856594]),
            {
              "landcover": 1,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([68.72361614300175, 27.501301962607624]),
            {
              "landcover": 1,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([68.74479880075837, 27.46263777538856]),
            {
              "landcover": 1,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([68.72685611823226, 27.497539342947263]),
            {
              "landcover": 1,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([68.75689685919906, 27.493428005738597]),
            {
              "landcover": 1,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7563818750682, 27.49220980226418]),
            {
              "landcover": 1,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7340658960643, 27.491943318457384]),
            {
              "landcover": 1,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([68.76999421823669, 27.483272673398723]),
            {
              "landcover": 1,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7735991071527, 27.4893259803015]),
            {
              "landcover": 1,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([68.75357909906555, 27.487323947399403]),
            {
              "landcover": 1,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([68.78157959948277, 27.48495325963836]),
            {
              "landcover": 1,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([68.77406941424107, 27.482764122150737]),
            {
              "landcover": 1,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([68.79594306433887, 27.483013195010265]),
            {
              "landcover": 1,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7511715094375, 27.466691324530128]),
            {
              "landcover": 1,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([68.74797034561344, 27.462883469875578]),
            {
              "landcover": 1,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([69.02904364414616, 27.42061962774219]),
            {
              "landcover": 1,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([69.01192959578992, 27.443381082789745]),
            {
              "landcover": 1,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([69.01124295028211, 27.435535100484717]),
            {
              "landcover": 1,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([68.99467762740613, 27.432792683849456]),
            {
              "landcover": 1,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([69.00904980638707, 27.36395437099594]),
            {
              "landcover": 1,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([69.00754776933873, 27.359609367241333]),
            {
              "landcover": 1,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([68.99407235124791, 27.352786605015773]),
            {
              "landcover": 1,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([69.00677529314244, 27.343295024496584]),
            {
              "landcover": 1,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([68.99716225603306, 27.34127462327674]),
            {
              "landcover": 1,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([68.98617986423665, 27.303968177806436]),
            {
              "landcover": 1,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([68.97905591709309, 27.301947059994646]),
            {
              "landcover": 1,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([68.96335751619864, 27.297913402661834]),
            {
              "landcover": 1,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([68.96425873842765, 27.29901934205883]),
            {
              "landcover": 1,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([68.96706969347525, 27.2998678570579]),
            {
              "landcover": 1,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61316155727597, 27.2710943691877]),
            {
              "landcover": 1,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([68.59651040371152, 27.27544284143976]),
            {
              "landcover": 1,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([68.66077903519108, 27.258437675067658]),
            {
              "landcover": 1,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([68.65494254837468, 27.24958661974538]),
            {
              "landcover": 1,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([68.63042133106848, 27.21886564052209]),
            {
              "landcover": 1,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61973541035314, 27.218827477366858]),
            {
              "landcover": 1,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([68.36538274239473, 27.57640887543784]),
            {
              "landcover": 1,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([68.35439641426973, 27.587211679301983]),
            {
              "landcover": 1,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([68.36126286934785, 27.557235083336895]),
            {
              "landcover": 1,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([68.41104466866426, 27.542203402813968]),
            {
              "landcover": 1,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([68.32223083628827, 27.438156434811326]),
            {
              "landcover": 1,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([68.36574089603228, 27.431573966424423]),
            {
              "landcover": 1,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([68.39045313324424, 27.431830488667707]),
            {
              "landcover": 1,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([68.41468853212719, 27.415450605898513]),
            {
              "landcover": 1,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([68.36041250166238, 27.39504917603713]),
            {
              "landcover": 1,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([68.34359100387309, 27.410821361497355]),
            {
              "landcover": 1,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([68.37353547052648, 27.341564732217535]),
            {
              "landcover": 1,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([68.34752877191808, 27.347511452607087]),
            {
              "landcover": 1,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([68.40715715006962, 27.34394062166833]),
            {
              "landcover": 1,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([68.19444017805108, 27.298611830543138]),
            {
              "landcover": 1,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([68.2010705987359, 27.300251657457963]),
            {
              "landcover": 1,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([68.76703922315383, 25.569236409696046]),
            {
              "landcover": 1,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([68.72378055616164, 25.537333141444993]),
            {
              "landcover": 1,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([68.67314044996047, 25.54136023582535]),
            {
              "landcover": 1,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([68.6987796069327, 25.53659173129099]),
            {
              "landcover": 1,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([68.69075443756014, 25.531906162699155]),
            {
              "landcover": 1,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([68.68169929992587, 25.53632067032797]),
            {
              "landcover": 1,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([68.31338335991553, 25.393650460496]),
            {
              "landcover": 1,
              "system:index": "60"
            }),
        ee.Feature(
            ee.Geometry.Point([68.31282546044044, 25.392584308705697]),
            {
              "landcover": 1,
              "system:index": "61"
            }),
        ee.Feature(
            ee.Geometry.Point([69.02112781951446, 27.80760933488807]),
            {
              "landcover": 1,
              "system:index": "62"
            }),
        ee.Feature(
            ee.Geometry.Point([69.02185738036651, 27.806850143464274]),
            {
              "landcover": 1,
              "system:index": "63"
            }),
        ee.Feature(
            ee.Geometry.Point([69.00046170572745, 27.81418665908794]),
            {
              "landcover": 1,
              "system:index": "64"
            }),
        ee.Feature(
            ee.Geometry.Point([68.97464871133263, 27.832716875083925]),
            {
              "landcover": 1,
              "system:index": "65"
            }),
        ee.Feature(
            ee.Geometry.Point([68.18705928465417, 27.551597930565997]),
            {
              "landcover": 1,
              "system:index": "66"
            }),
        ee.Feature(
            ee.Geometry.Point([68.18122279783776, 27.54315083556963]),
            {
              "landcover": 1,
              "system:index": "67"
            }),
        ee.Feature(
            ee.Geometry.Point([68.67007652273914, 27.98055865404515]),
            {
              "landcover": 1,
              "system:index": "68"
            }),
        ee.Feature(
            ee.Geometry.Point([68.6526528929784, 27.98654650358345]),
            {
              "landcover": 1,
              "system:index": "69"
            }),
        ee.Feature(
            ee.Geometry.Point([68.10451565204981, 26.050936801525495]),
            {
              "landcover": 1,
              "system:index": "70"
            }),
        ee.Feature(
            ee.Geometry.Point([68.1151586574209, 26.04769811025949]),
            {
              "landcover": 1,
              "system:index": "71"
            }),
        ee.Feature(
            ee.Geometry.Point([68.12593040882471, 26.056180207174044]),
            {
              "landcover": 1,
              "system:index": "72"
            }),
        ee.Feature(
            ee.Geometry.Point([68.12022266804102, 26.05452239104304]),
            {
              "landcover": 1,
              "system:index": "73"
            }),
        ee.Feature(
            ee.Geometry.Point([68.11434326588038, 26.05591033172765]),
            {
              "landcover": 1,
              "system:index": "74"
            }),
        ee.Feature(
            ee.Geometry.Point([68.11108169971827, 26.056103099967068]),
            {
              "landcover": 1,
              "system:index": "75"
            }),
        ee.Feature(
            ee.Geometry.Point([68.09649048267725, 26.0498572477129]),
            {
              "landcover": 1,
              "system:index": "76"
            }),
        ee.Feature(
            ee.Geometry.Point([68.10561651822876, 26.063710190767807]),
            {
              "landcover": 1,
              "system:index": "77"
            }),
        ee.Feature(
            ee.Geometry.Point([67.67361952232785, 26.8305364581719]),
            {
              "landcover": 1,
              "system:index": "78"
            }),
        ee.Feature(
            ee.Geometry.Point([67.66198946403928, 26.82716642079591]),
            {
              "landcover": 1,
              "system:index": "79"
            }),
        ee.Feature(
            ee.Geometry.Point([67.66391861053522, 26.839050868992544]),
            {
              "landcover": 1,
              "system:index": "80"
            }),
        ee.Feature(
            ee.Geometry.Point([67.65529262634332, 26.838055261416102]),
            {
              "landcover": 1,
              "system:index": "81"
            }),
        ee.Feature(
            ee.Geometry.Point([67.66445867880545, 26.851854755311575]),
            {
              "landcover": 1,
              "system:index": "82"
            }),
        ee.Feature(
            ee.Geometry.Point([67.65750639303884, 26.8500169115932]),
            {
              "landcover": 1,
              "system:index": "83"
            }),
        ee.Feature(
            ee.Geometry.Point([67.65381567343435, 26.850361509563676]),
            {
              "landcover": 1,
              "system:index": "84"
            }),
        ee.Feature(
            ee.Geometry.Point([67.67784845377507, 26.86857933546589]),
            {
              "landcover": 1,
              "system:index": "85"
            }),
        ee.Feature(
            ee.Geometry.Point([67.67436522368428, 26.88030281502798]),
            {
              "landcover": 1,
              "system:index": "86"
            }),
        ee.Feature(
            ee.Geometry.Point([67.70641662200265, 26.904037470702615]),
            {
              "landcover": 1,
              "system:index": "87"
            }),
        ee.Feature(
            ee.Geometry.Point([69.22315483470591, 25.25304845043491]),
            {
              "landcover": 1,
              "system:index": "88"
            }),
        ee.Feature(
            ee.Geometry.Point([69.2233694114271, 25.254368120281352]),
            {
              "landcover": 1,
              "system:index": "89"
            }),
        ee.Feature(
            ee.Geometry.Point([69.22070866008433, 25.254756255742812]),
            {
              "landcover": 1,
              "system:index": "90"
            }),
        ee.Feature(
            ee.Geometry.Point([69.22581558604868, 25.25289319421624]),
            {
              "landcover": 1,
              "system:index": "91"
            })]),
    barrenland = 
    /* color: #efff3c */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([69.24715238911894, 26.353837057835484]),
            {
              "landcover": 2,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([69.55751615865019, 26.271359871564727]),
            {
              "landcover": 2,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([68.89243835704167, 27.4840582874447]),
            {
              "landcover": 2,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([68.89484161631901, 27.462735967362498]),
            {
              "landcover": 2,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([68.94496673838933, 27.439581349478836]),
            {
              "landcover": 2,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([69.04997888790206, 27.427697487621323]),
            {
              "landcover": 2,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([69.19657770382003, 27.426478557654022]),
            {
              "landcover": 2,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([68.98742440921956, 27.29943014485528]),
            {
              "landcover": 2,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([68.95256464446982, 27.294337104229864]),
            {
              "landcover": 2,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([68.94535486663779, 27.29658717975014]),
            {
              "landcover": 2,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([68.97217695678671, 27.29254463855863]),
            {
              "landcover": 2,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([68.95977442230185, 27.295519352984954]),
            {
              "landcover": 2,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([68.86843759539062, 27.27598907473324]),
            {
              "landcover": 2,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([68.82311899187499, 27.29368627678177]),
            {
              "landcover": 2,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([68.76063425066405, 27.30527946634549]),
            {
              "landcover": 2,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([68.28476104005492, 27.295883990303853]),
            {
              "landcover": 2,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([68.23600920900023, 27.32013629964775]),
            {
              "landcover": 2,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([68.20579518224511, 27.32406427997595]),
            {
              "landcover": 2,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([68.20116032506738, 27.312930624288242]),
            {
              "landcover": 2,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([68.24089067379185, 27.269193043398488]),
            {
              "landcover": 2,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([68.2765962401981, 27.251186724293106]),
            {
              "landcover": 2,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([68.23402421871373, 27.23928264175217]),
            {
              "landcover": 2,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([68.20398347774693, 27.228751045735752]),
            {
              "landcover": 2,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([68.0481740104215, 27.155943868433056]),
            {
              "landcover": 2,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([67.98895083537268, 27.15380550576374]),
            {
              "landcover": 2,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7073479648096, 26.907614981284333]),
            {
              "landcover": 2,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([68.0128500832846, 25.869966825151185]),
            {
              "landcover": 2,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([70.4672394503524, 24.55164057060442]),
            {
              "landcover": 2,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([70.28888986153325, 24.547253825994378]),
            {
              "landcover": 2,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([70.34122526612143, 24.669884104719422]),
            {
              "landcover": 2,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([69.03117001006622, 27.80286430145005]),
            {
              "landcover": 2,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([67.95000542660863, 26.137162051448428]),
            {
              "landcover": 2,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([67.63826836606175, 26.069335015340272]),
            {
              "landcover": 2,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([67.53389824887425, 26.044660889698914]),
            {
              "landcover": 2,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([67.926659479343, 25.62936174734804]),
            {
              "landcover": 2,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([67.61128398145692, 25.34461395781404]),
            {
              "landcover": 2,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([67.89295526302925, 24.941838709405538]),
            {
              "landcover": 2,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([67.48056717274652, 24.906285846329645]),
            {
              "landcover": 2,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([68.32305069049552, 25.577481175334313]),
            {
              "landcover": 2,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([68.22074050983146, 25.57376498277993]),
            {
              "landcover": 2,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([68.28117137351597, 25.722388531905764]),
            {
              "landcover": 2,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([68.22486644187535, 25.74589316364068]),
            {
              "landcover": 2,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([68.23035960593785, 25.84756529866193]),
            {
              "landcover": 2,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([68.10914934084201, 26.045339547798868]),
            {
              "landcover": 2,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([68.0782765668437, 26.072461816031474]),
            {
              "landcover": 2,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([68.07942019156458, 26.07914912178629]),
            {
              "landcover": 2,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([68.04877987815573, 26.09784127200744]),
            {
              "landcover": 2,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([68.04630991764013, 26.112045606135403]),
            {
              "landcover": 2,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([68.02383609287816, 26.12738759986081]),
            {
              "landcover": 2,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([67.98772100706073, 26.142878504415297]),
            {
              "landcover": 2,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([67.87630895870277, 26.155756901654698]),
            {
              "landcover": 2,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([67.82240728633948, 26.1659259420078]),
            {
              "landcover": 2,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([67.77537206905433, 26.176710318917543]),
            {
              "landcover": 2,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([67.74371286432756, 26.178058055545137]),
            {
              "landcover": 2,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([67.70045419733538, 26.168814471847085]),
            {
              "landcover": 2,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([67.67153705872117, 26.18819624468075]),
            {
              "landcover": 2,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([67.61729206360398, 26.198978560865324]),
            {
              "landcover": 2,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([67.63205494202195, 26.233261259114972]),
            {
              "landcover": 2,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([67.61660541809617, 26.246502835151073]),
            {
              "landcover": 2,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([67.62270021644743, 26.327703787205113]),
            {
              "landcover": 2,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([67.55150332695925, 26.4302600930831]),
            {
              "landcover": 2,
              "system:index": "60"
            }),
        ee.Feature(
            ee.Geometry.Point([69.40023064272609, 26.508419687732317]),
            {
              "landcover": 2,
              "system:index": "61"
            }),
        ee.Feature(
            ee.Geometry.Point([70.18575310366359, 26.954870505587966]),
            {
              "landcover": 2,
              "system:index": "62"
            }),
        ee.Feature(
            ee.Geometry.Point([69.75400643451654, 27.526392830660683]),
            {
              "landcover": 2,
              "system:index": "63"
            }),
        ee.Feature(
            ee.Geometry.Point([71.22647416023247, 27.552185945987958]),
            {
              "landcover": 2,
              "system:index": "64"
            }),
        ee.Feature(
            ee.Geometry.Point([73.0061166736311, 27.51130998162083]),
            {
              "landcover": 2,
              "system:index": "65"
            }),
        ee.Feature(
            ee.Geometry.Point([72.95393161503735, 27.6549398479575]),
            {
              "landcover": 2,
              "system:index": "66"
            }),
        ee.Feature(
            ee.Geometry.Point([72.5062387439436, 28.27899758367921]),
            {
              "landcover": 2,
              "system:index": "67"
            }),
        ee.Feature(
            ee.Geometry.Point([74.07462590002758, 28.691118186844143]),
            {
              "landcover": 2,
              "system:index": "68"
            }),
        ee.Feature(
            ee.Geometry.Point([69.31820759312852, 26.20961200183507]),
            {
              "landcover": 2,
              "system:index": "69"
            }),
        ee.Feature(
            ee.Geometry.Point([69.37641866824977, 26.05950617579703]),
            {
              "landcover": 2,
              "system:index": "70"
            }),
        ee.Feature(
            ee.Geometry.Point([69.3511934560388, 26.12887569361675]),
            {
              "landcover": 2,
              "system:index": "71"
            }),
        ee.Feature(
            ee.Geometry.Point([69.65730521343946, 25.92927784244635]),
            {
              "landcover": 2,
              "system:index": "72"
            }),
        ee.Feature(
            ee.Geometry.Point([69.79563966469102, 25.79324580800267]),
            {
              "landcover": 2,
              "system:index": "73"
            }),
        ee.Feature(
            ee.Geometry.Point([69.72663179115587, 25.772533124679054]),
            {
              "landcover": 2,
              "system:index": "74"
            }),
        ee.Feature(
            ee.Geometry.Point([69.60381022881835, 25.782935408477595]),
            {
              "landcover": 2,
              "system:index": "75"
            }),
        ee.Feature(
            ee.Geometry.Point([69.54578868340819, 25.777988994788764]),
            {
              "landcover": 2,
              "system:index": "76"
            }),
        ee.Feature(
            ee.Geometry.Point([69.53686229180663, 25.790045516774768]),
            {
              "landcover": 2,
              "system:index": "77"
            }),
        ee.Feature(
            ee.Geometry.Point([69.59910861617065, 25.695747598347708]),
            {
              "landcover": 2,
              "system:index": "78"
            }),
        ee.Feature(
            ee.Geometry.Point([69.98082160500073, 25.495923603676303]),
            {
              "landcover": 2,
              "system:index": "79"
            }),
        ee.Feature(
            ee.Geometry.Point([69.89499091652416, 25.472369763722497]),
            {
              "landcover": 2,
              "system:index": "80"
            }),
        ee.Feature(
            ee.Geometry.Point([69.77062668377583, 25.456704720583353]),
            {
              "landcover": 2,
              "system:index": "81"
            }),
        ee.Feature(
            ee.Geometry.Point([69.78524800770583, 25.395413736660917]),
            {
              "landcover": 2,
              "system:index": "82"
            }),
        ee.Feature(
            ee.Geometry.Point([69.89511128895583, 25.35012373303964]),
            {
              "landcover": 2,
              "system:index": "83"
            }),
        ee.Feature(
            ee.Geometry.Point([69.80413075917068, 25.33988459967038]),
            {
              "landcover": 2,
              "system:index": "84"
            }),
        ee.Feature(
            ee.Geometry.Point([69.7774670934427, 25.27704733415099]),
            {
              "landcover": 2,
              "system:index": "85"
            }),
        ee.Feature(
            ee.Geometry.Point([69.90758641717316, 25.262765754201343]),
            {
              "landcover": 2,
              "system:index": "86"
            }),
        ee.Feature(
            ee.Geometry.Point([68.71164538037736, 27.33019544415417]),
            {
              "landcover": 2,
              "system:index": "87"
            }),
        ee.Feature(
            ee.Geometry.Point([68.70834089887101, 27.32949013059556]),
            {
              "landcover": 2,
              "system:index": "88"
            })]),
    water_bodies = 
    /* color: #3158ff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([68.75595831490762, 27.52316488626274]),
            {
              "landcover": 3,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7542980349531, 27.52086923959426]),
            {
              "landcover": 3,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([67.94346583731854, 26.848779553668635]),
            {
              "landcover": 3,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([67.96440852530682, 26.872516330644924]),
            {
              "landcover": 3,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([67.62398492117414, 26.40610880688753]),
            {
              "landcover": 3,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([67.64252434988508, 26.397498431064307]),
            {
              "landcover": 3,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([68.29225218659384, 26.354104026294163]),
            {
              "landcover": 3,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([68.18101561432822, 26.35810328247826]),
            {
              "landcover": 3,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([69.12455585962813, 26.112198088770192]),
            {
              "landcover": 3,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([68.05101574888216, 24.94625841735825]),
            {
              "landcover": 3,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([67.77476687377256, 24.800670101680765]),
            {
              "landcover": 3,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([67.13733084767902, 25.283727051024655]),
            {
              "landcover": 3,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([67.9275332251452, 25.410131059345012]),
            {
              "landcover": 3,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([69.6708093157978, 28.37221004534489]),
            {
              "landcover": 3,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([69.51281145335062, 28.2865698928452]),
            {
              "landcover": 3,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([69.34865679356517, 28.28491688036809]),
            {
              "landcover": 3,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([69.38838051680752, 28.242651139648892]),
            {
              "landcover": 3,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([69.36920234864202, 28.098498956819647]),
            {
              "landcover": 3,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([69.26641409640014, 28.089184540240048]),
            {
              "landcover": 3,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([69.34228713171096, 28.118104813897368]),
            {
              "landcover": 3,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([69.31154314195473, 28.14997433296838]),
            {
              "landcover": 3,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([69.3032175651725, 28.149217547633185]),
            {
              "landcover": 3,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([69.28742123441899, 28.147937204928702]),
            {
              "landcover": 3,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([69.2090014680921, 28.2070894529725]),
            {
              "landcover": 3,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([69.23934261646856, 28.207618916700586]),
            {
              "landcover": 3,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([69.24794174510771, 28.212719529205895]),
            {
              "landcover": 3,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([69.17624750193613, 28.235175716958558]),
            {
              "landcover": 3,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([69.16697778758066, 28.23804916101504]),
            {
              "landcover": 3,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([69.16032590922373, 28.240166386062082]),
            {
              "landcover": 3,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([69.13446941432017, 28.25007141645557]),
            {
              "landcover": 3,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([69.13283863123911, 28.248937299306142]),
            {
              "landcover": 3,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([69.12719526347178, 28.245648291364677]),
            {
              "landcover": 3,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([69.12925519999521, 28.24992020153255]),
            {
              "landcover": 3,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([69.125435734358, 28.24589402534917]),
            {
              "landcover": 3,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([69.08714872796706, 28.196427638594816]),
            {
              "landcover": 3,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([69.08581835229568, 28.201042634530452]),
            {
              "landcover": 3,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([69.02285061227072, 28.05722997222266]),
            {
              "landcover": 3,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([69.17113563053803, 28.072071990274512]),
            {
              "landcover": 3,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([69.14703703203463, 28.090311998573124]),
            {
              "landcover": 3,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([69.17098379411959, 28.0875103075511]),
            {
              "landcover": 3,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([68.29345762811812, 27.368778194893583]),
            {
              "landcover": 3,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([67.85170644580982, 26.96219301957188]),
            {
              "landcover": 3,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([67.92200177967213, 26.94788634957964]),
            {
              "landcover": 3,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([67.89101690113209, 26.950411188051262]),
            {
              "landcover": 3,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([68.13648132452761, 24.03489313042745]),
            {
              "landcover": 3,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([68.2181921399573, 24.041164094212675]),
            {
              "landcover": 3,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([68.24577843124938, 24.044236160817988]),
            {
              "landcover": 3,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([68.24318205292296, 24.04445171459933]),
            {
              "landcover": 3,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([68.24395452911925, 24.037886959904284]),
            {
              "landcover": 3,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([68.9344510949635, 26.999327507410257]),
            {
              "landcover": 3,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([68.9462142857234, 26.986169175002967]),
            {
              "landcover": 3,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([68.9554610804711, 26.972836453161076]),
            {
              "landcover": 3,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([68.95906596938711, 26.97107707353886]),
            {
              "landcover": 3,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([68.96404649605236, 26.948815916829265]),
            {
              "landcover": 3,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([68.71112538786674, 27.48589118212923]),
            {
              "landcover": 3,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([68.70198441954399, 27.473555405202497]),
            {
              "landcover": 3,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([69.01579197677137, 27.436068340250827]),
            {
              "landcover": 3,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([69.00111440403157, 27.318934056194106]),
            {
              "landcover": 3,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([68.30443557310049, 27.53058213360928]),
            {
              "landcover": 3,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([68.27819957890698, 27.47915044923095]),
            {
              "landcover": 3,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([68.26154842534253, 27.469860103133456]),
            {
              "landcover": 3,
              "system:index": "60"
            }),
        ee.Feature(
            ee.Geometry.Point([68.28180569303336, 27.42566294836499]),
            {
              "landcover": 3,
              "system:index": "61"
            }),
        ee.Feature(
            ee.Geometry.Point([68.67534945266175, 25.533406753771608]),
            {
              "landcover": 3,
              "system:index": "62"
            }),
        ee.Feature(
            ee.Geometry.Point([68.31084144526034, 25.401448441398497]),
            {
              "landcover": 3,
              "system:index": "63"
            }),
        ee.Feature(
            ee.Geometry.Point([70.37625892056724, 24.536962459768514]),
            {
              "landcover": 3,
              "system:index": "64"
            }),
        ee.Feature(
            ee.Geometry.Point([70.3054338690267, 24.661616178077246]),
            {
              "landcover": 3,
              "system:index": "65"
            }),
        ee.Feature(
            ee.Geometry.Point([68.94054977970704, 27.79649234524847]),
            {
              "landcover": 3,
              "system:index": "66"
            }),
        ee.Feature(
            ee.Geometry.Point([67.84959512411379, 26.637774581072733]),
            {
              "landcover": 3,
              "system:index": "67"
            }),
        ee.Feature(
            ee.Geometry.Point([67.90924645469357, 26.429304925398036]),
            {
              "landcover": 3,
              "system:index": "68"
            }),
        ee.Feature(
            ee.Geometry.Point([68.19495570799401, 27.553500339805694]),
            {
              "landcover": 3,
              "system:index": "69"
            }),
        ee.Feature(
            ee.Geometry.Point([68.65401991354925, 27.889355579379092]),
            {
              "landcover": 3,
              "system:index": "70"
            }),
        ee.Feature(
            ee.Geometry.Point([68.31915775002197, 25.445965511363063]),
            {
              "landcover": 3,
              "system:index": "71"
            }),
        ee.Feature(
            ee.Geometry.Point([68.34599238690328, 25.43226344531413]),
            {
              "landcover": 3,
              "system:index": "72"
            }),
        ee.Feature(
            ee.Geometry.Point([68.31935523316788, 25.418525265180826]),
            {
              "landcover": 3,
              "system:index": "73"
            }),
        ee.Feature(
            ee.Geometry.Point([68.32952729470561, 25.42460739124219]),
            {
              "landcover": 3,
              "system:index": "74"
            }),
        ee.Feature(
            ee.Geometry.Point([68.206444446125, 26.014348767500977]),
            {
              "landcover": 3,
              "system:index": "75"
            }),
        ee.Feature(
            ee.Geometry.Point([68.17922349815204, 26.028780826721494]),
            {
              "landcover": 3,
              "system:index": "76"
            }),
        ee.Feature(
            ee.Geometry.Point([68.15393827351429, 26.039792686539545]),
            {
              "landcover": 3,
              "system:index": "77"
            }),
        ee.Feature(
            ee.Geometry.Point([68.13497640648154, 26.050529292775693]),
            {
              "landcover": 3,
              "system:index": "78"
            }),
        ee.Feature(
            ee.Geometry.Point([69.29900839744505, 26.054275925496977]),
            {
              "landcover": 3,
              "system:index": "79"
            }),
        ee.Feature(
            ee.Geometry.Point([69.25986960349974, 26.0345345040568]),
            {
              "landcover": 3,
              "system:index": "80"
            }),
        ee.Feature(
            ee.Geometry.Point([69.33308674446566, 25.971050811519003]),
            {
              "landcover": 3,
              "system:index": "81"
            }),
        ee.Feature(
            ee.Geometry.Point([69.39400142775804, 25.9158018899963]),
            {
              "landcover": 3,
              "system:index": "82"
            }),
        ee.Feature(
            ee.Geometry.Point([69.56259910715696, 25.67718387416315]),
            {
              "landcover": 3,
              "system:index": "83"
            }),
        ee.Feature(
            ee.Geometry.Point([69.55058281077024, 25.701625507834475]),
            {
              "landcover": 3,
              "system:index": "84"
            }),
        ee.Feature(
            ee.Geometry.Point([69.5378798688757, 25.680278029077304]),
            {
              "landcover": 3,
              "system:index": "85"
            })]),
    Urban = 
    /* color: #ff4094 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([68.34630676135022, 25.386554366168795]),
            {
              "landcover": 4,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([68.36594053133923, 25.387252246899894]),
            {
              "landcover": 4,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([68.20255377907732, 27.560765124383973]),
            {
              "landcover": 4,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([68.19542983193377, 27.560080306166732]),
            {
              "landcover": 4,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([68.19997885842302, 27.554411369114085]),
            {
              "landcover": 4,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([68.18690738581154, 27.538787325255228]),
            {
              "landcover": 4,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([68.62453736166756, 27.95012870180032]),
            {
              "landcover": 4,
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([68.64535130362313, 27.953578413225134]),
            {
              "landcover": 4,
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([68.6380318609889, 27.946070113213473]),
            {
              "landcover": 4,
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([68.65137853304701, 27.93970088632365]),
            {
              "landcover": 4,
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([67.287981428486, 24.8320603698001]),
            {
              "landcover": 4,
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([67.30295888362517, 24.83548770274053]),
            {
              "landcover": 4,
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([67.30519048152556, 24.836617143946526]),
            {
              "landcover": 4,
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([67.28167287288298, 24.835643488347078]),
            {
              "landcover": 4,
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([67.31124798713762, 24.818810800990267]),
            {
              "landcover": 4,
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([67.30631272255022, 24.82145948630333]),
            {
              "landcover": 4,
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([67.27418571142859, 24.813148700070048]),
            {
              "landcover": 4,
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([67.34822834045195, 24.8515986740539]),
            {
              "landcover": 4,
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([67.15495694310432, 24.85411058739695]),
            {
              "landcover": 4,
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([67.1539269748426, 24.852728189600857]),
            {
              "landcover": 4,
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([68.3475611782604, 25.41130155672928]),
            {
              "landcover": 4,
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([68.33953600888785, 25.411224030077644]),
            {
              "landcover": 4,
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([68.36569159830233, 25.415574543386395]),
            {
              "landcover": 4,
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([68.38175890164821, 25.4061039172604]),
            {
              "landcover": 4,
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([68.38875410275905, 25.401296963505665]),
            {
              "landcover": 4,
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([68.45365204662454, 25.39122296507303]),
            {
              "landcover": 4,
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([68.45436430846813, 25.40611704368371]),
            {
              "landcover": 4,
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([68.45335579787853, 25.40788083735879]),
            {
              "landcover": 4,
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([68.47233937707217, 25.410933802503614]),
            {
              "landcover": 4,
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([68.4727041574982, 25.410739985190112]),
            {
              "landcover": 4,
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([68.4844334882898, 25.41006570788664]),
            {
              "landcover": 4,
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([68.5245972385879, 25.425706540142446]),
            {
              "landcover": 4,
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([68.53204844267927, 25.42810110717535]),
            {
              "landcover": 4,
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([68.54788893867142, 25.43392730079722]),
            {
              "landcover": 4,
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([68.560999450937, 25.436382250486382]),
            {
              "landcover": 4,
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([68.56112300691001, 25.436827186579322]),
            {
              "landcover": 4,
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([68.57156292963256, 25.455812491400582]),
            {
              "landcover": 4,
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([68.57235686350097, 25.459319224389276]),
            {
              "landcover": 4,
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61897264162829, 25.519797322470637]),
            {
              "landcover": 4,
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61789975802233, 25.52316664354108]),
            {
              "landcover": 4,
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61548576990893, 25.52154976851105]),
            {
              "landcover": 4,
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61558232943347, 25.522014501289554]),
            {
              "landcover": 4,
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61459472736841, 25.52316629654539]),
            {
              "landcover": 4,
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61449816784388, 25.523277637437655]),
            {
              "landcover": 4,
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([67.69477362455532, 26.904273686182364]),
            {
              "landcover": 4,
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([69.18140827941505, 25.250213434224854]),
            {
              "landcover": 4,
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([69.17962728239536, 25.253261582400555]),
            {
              "landcover": 4,
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([69.17763171888828, 25.253261582400555]),
            {
              "landcover": 4,
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([69.22793567134164, 25.26648553629661]),
            {
              "landcover": 4,
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([69.2283207140791, 25.267349164190115]),
            {
              "landcover": 4,
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([69.25395861736214, 25.270356877208574]),
            {
              "landcover": 4,
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([69.25389424434579, 25.26976504618152]),
            {
              "landcover": 4,
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([69.25398713813664, 25.272125068991155]),
            {
              "landcover": 4,
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([69.25716695122816, 25.272585532087078]),
            {
              "landcover": 4,
              "system:index": "53"
            }),
        ee.Feature(
            ee.Geometry.Point([69.25785674609234, 25.274035657504065]),
            {
              "landcover": 4,
              "system:index": "54"
            }),
        ee.Feature(
            ee.Geometry.Point([69.255333007056, 25.27598473584298]),
            {
              "landcover": 4,
              "system:index": "55"
            }),
        ee.Feature(
            ee.Geometry.Point([69.57879774103425, 25.10940515723174]),
            {
              "landcover": 4,
              "system:index": "56"
            }),
        ee.Feature(
            ee.Geometry.Point([68.65603181266464, 27.343850801852835]),
            {
              "landcover": 4,
              "system:index": "57"
            }),
        ee.Feature(
            ee.Geometry.Point([68.6690331531329, 27.34652818440799]),
            {
              "landcover": 4,
              "system:index": "58"
            }),
        ee.Feature(
            ee.Geometry.Point([68.67516582954116, 27.344638709863876]),
            {
              "landcover": 4,
              "system:index": "59"
            }),
        ee.Feature(
            ee.Geometry.Point([68.67471521842666, 27.344352809735696]),
            {
              "landcover": 4,
              "system:index": "60"
            }),
        ee.Feature(
            ee.Geometry.Point([68.66884756921215, 27.341153323767827]),
            {
              "landcover": 4,
              "system:index": "61"
            }),
        ee.Feature(
            ee.Geometry.Point([68.6694029013581, 27.342931363474214]),
            {
              "landcover": 4,
              "system:index": "62"
            }),
        ee.Feature(
            ee.Geometry.Point([68.6649286876877, 27.33926216674502]),
            {
              "landcover": 4,
              "system:index": "63"
            }),
        ee.Feature(
            ee.Geometry.Point([68.66953977511123, 27.332329554900184]),
            {
              "landcover": 4,
              "system:index": "64"
            }),
        ee.Feature(
            ee.Geometry.Point([68.7202913090689, 27.356358004704653]),
            {
              "landcover": 4,
              "system:index": "65"
            }),
        ee.Feature(
            ee.Geometry.Point([68.71550934431536, 27.357765151678382]),
            {
              "landcover": 4,
              "system:index": "66"
            }),
        ee.Feature(
            ee.Geometry.Point([68.71976821900073, 27.358563805568288]),
            {
              "landcover": 4,
              "system:index": "67"
            }),
        ee.Feature(
            ee.Geometry.Point([68.72178524017993, 27.360731584971937]),
            {
              "landcover": 4,
              "system:index": "68"
            }),
        ee.Feature(
            ee.Geometry.Point([68.72358080872769, 27.360335262996028]),
            {
              "landcover": 4,
              "system:index": "69"
            }),
        ee.Feature(
            ee.Geometry.Point([68.72442034014935, 27.36049724978314]),
            {
              "landcover": 4,
              "system:index": "70"
            }),
        ee.Feature(
            ee.Geometry.Point([68.66691999420226, 27.36414526085974]),
            {
              "landcover": 4,
              "system:index": "71"
            }),
        ee.Feature(
            ee.Geometry.Point([68.66573445781768, 27.36483606144042]),
            {
              "landcover": 4,
              "system:index": "72"
            }),
        ee.Feature(
            ee.Geometry.Point([68.63555343170579, 27.36744960397099]),
            {
              "landcover": 4,
              "system:index": "73"
            }),
        ee.Feature(
            ee.Geometry.Point([68.63510013838227, 27.367509154137366]),
            {
              "landcover": 4,
              "system:index": "74"
            }),
        ee.Feature(
            ee.Geometry.Point([68.61180215528432, 27.38324181154381]),
            {
              "landcover": 4,
              "system:index": "75"
            }),
        ee.Feature(
            ee.Geometry.Point([68.63728860090283, 27.434798164700254]),
            {
              "landcover": 4,
              "system:index": "76"
            }),
        ee.Feature(
            ee.Geometry.Point([68.63681921432523, 27.4346243839524]),
            {
              "landcover": 4,
              "system:index": "77"
            }),
        ee.Feature(
            ee.Geometry.Point([68.63632568786649, 27.434898148020242]),
            {
              "landcover": 4,
              "system:index": "78"
            }),
        ee.Feature(
            ee.Geometry.Point([68.53558613974428, 27.446497691403366]),
            {
              "landcover": 4,
              "system:index": "79"
            }),
        ee.Feature(
            ee.Geometry.Point([67.91336390895931, 27.852629646410907]),
            {
              "landcover": 4,
              "system:index": "80"
            }),
        ee.Feature(
            ee.Geometry.Point([67.91220519466488, 27.85297113913646]),
            {
              "landcover": 4,
              "system:index": "81"
            }),
        ee.Feature(
            ee.Geometry.Point([67.91090700550167, 27.853312630786473]),
            {
              "landcover": 4,
              "system:index": "82"
            }),
        ee.Feature(
            ee.Geometry.Point([67.91275236530392, 27.852809878816757]),
            {
              "landcover": 4,
              "system:index": "83"
            }),
        ee.Feature(
            ee.Geometry.Point([67.9062081945513, 27.852978137342248]),
            {
              "landcover": 4,
              "system:index": "84"
            }),
        ee.Feature(
            ee.Geometry.Point([67.90558592205984, 27.852276178951584]),
            {
              "landcover": 4,
              "system:index": "85"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
