// Map of popular car models to their image URLs
const carImages = {
  // Porsche
  "porsche gt3": "https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png",
  "911": "https://files.porsche.com/filestore/image/multimedia/none/992-modelimage-sideshot/model/2ed91c19-bbc7-11e9-80c4-005056bbdc38/porsche-model.png",
  "gt2 rs": "https://files.porsche.com/filestore/image/multimedia/none/991-2nd-gt2rs-modelimage-sideshot/model/cfbb8ed3-5952-11e9-80c4-005056bbdc38/porsche-model.png",
  "taycan": "https://files.porsche.com/filestore/image/multimedia/none/j1-taycan-modelimage-sideshot/model/c0fdb009-32a1-11ea-80c6-005056bbdc38/porsche-model.png",
  "cayman": "https://files.porsche.com/filestore/image/multimedia/none/982-718-cayman-gts-4-modelimage-sideshot/model/d7408f49-7f3b-11ea-80ca-005056bbdc38/porsche-model.png",
  
  // Lamborghini
  "lamborghini huracan": "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/facelift_2019/model_gw/huracan/2023/model_chooser/huracan_sterrato_m.png",
  "aventador": "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/facelift_2019/model_gw/aventador/2021/model_chooser/aventador_ultimae_roadster_m.png",
  "urus": "https://www.lamborghini.com/sites/it-en/files/DAM/lamborghini/facelift_2019/model_gw/urus/2023/model_chooser/urus_s_m.png",

  // Ferrari
  "ferrari 458": "https://www.pngmart.com/files/22/Ferrari-458-PNG-HD.png", 
  "f8 tributo": "https://vectorseek.com/wp-content/uploads/2023/06/Ferrari-F8-Tributo-PNG-Image.jpg",
  "sf90": "https://upload.wikimedia.org/wikipedia/commons/b/bc/SF90_Spider.png",
  
  // Tesla
  "tesla model s": "https://www.motortrend.com/uploads/sites/5/2020/06/2021-Tesla-Model-S-mmt-1.png",
  "model 3": "https://pngimg.com/d/tesla_car_PNG13.png",
  "model x": "https://www.pngall.com/wp-content/uploads/11/Tesla-Model-X-PNG-Photos.png",
  "roadster": "https://www.pngmart.com/files/22/Tesla-Roadster-PNG-HD.png",
  
  // BMW
  "bmw m4": "https://www.bmw.co.uk/content/dam/bmw/marketGB/bmw_co_uk/bmw-cars/m-models/m3-touring/bmw-m-models-m3-touring-ms-01.png/jcr:content/renditions/cq5dam.resized.img.585.low.time1675763058733.png",
  "m3": "https://www.bmw.co.uk/content/dam/bmw/marketGB/bmw_co_uk/bmw-cars/m-models/m3-sedan/bmw-3-series-sedan-m-automobiles-ms-01.png",
  "i8": "https://www.pngmart.com/files/22/BMW-I8-PNG-Picture.png",
  
  // Mercedes
  "mercedes amg gt": "https://www.motortrend.com/uploads/sites/5/2019/07/2020-Mercedes-AMG-GT-R-Pro-front-three-quarter-in-motion-5.jpg?fit=around%7C875:492.1875",
  "c63": "https://freepngimg.com/thumb/car/56185-4-mercedes-benz-c63-amg-free-transparent-image-hd.png",
  
  // Audi
  "audi r8": "https://www.pngall.com/wp-content/uploads/9/Audi-R8-PNG-Picture.png",
  "rs6": "https://www.pngall.com/wp-content/uploads/11/Audi-RS6-PNG-Photos.png",
  
  // McLaren
  "mclaren 720s": "https://www.pngmart.com/files/22/McLaren-720S-PNG-Photos.png",
  "p1": "https://www.pngall.com/wp-content/uploads/9/McLaren-P1-PNG-HD-Quality.png",
  
  // Bugatti
  "bugatti chiron": "https://www.pngmart.com/files/22/Bugatti-Chiron-PNG-Clipart.png",
  "veyron": "https://www.pngmart.com/files/22/Bugatti-Veyron-PNG-Transparent.png",
  
  // Default image if no match is found
  "default": "https://files.porsche.com/filestore/image/multimedia/none/992-gt3-modelimage-sideshot/model/765dfc51-51bc-11eb-80d1-005056bbdc38/porsche-model.png"
};

/**
 * Function to get a car image URL based on the car name
 * @param {string} carName - The name of the car to search for
 * @returns {string} - The URL of the car image
 */
export function getCarImageUrl(carName) {
  if (!carName) return carImages.default;
  
  // Convert to lowercase for case-insensitive matching
  const lowerCaseName = carName.toLowerCase();
  
  // Check for exact matches
  if (carImages[lowerCaseName]) {
    return carImages[lowerCaseName];
  }
  
  // Check for partial matches
  for (const [key, url] of Object.entries(carImages)) {
    if (lowerCaseName.includes(key) || key.includes(lowerCaseName)) {
      return url;
    }
  }
  
  // Check for brand matches
  const brands = ["porsche", "lamborghini", "ferrari", "tesla", "bmw", "mercedes", "audi", "mclaren", "bugatti"];
  for (const brand of brands) {
    if (lowerCaseName.includes(brand)) {
      // Return the first car image for that brand
      const brandCar = Object.keys(carImages).find(key => key.startsWith(brand));
      if (brandCar) {
        return carImages[brandCar];
      }
    }
  }
  
  // Return default image if no match is found
  return carImages.default;
} 