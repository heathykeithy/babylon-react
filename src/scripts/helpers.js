

//Function to add values of objects with the same keys

export const addObjects= (obj1, obj2)=>{
    var result = {};
    for (var key in obj1) {
        if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
            result[key] = obj1[key] + obj2[key];
        }
        else{
            console.error("addObjects() different keys,  " + {obj1, obj2}
             );
        }
    }
    return result;
}
