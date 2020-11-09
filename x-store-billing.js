'use strict'
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-west-2'});

                let servicecharge =0;
                let tax = 0;
                let specialoffer =0;
                
exports.handler = function (event,context,callback)  {
    // TODO implement
    
    function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
    
   //Get pricing rules metadata starts here 
    const paramsrule = {
            TableName: "priceandpromorules"
        };
   
dynamodb.scan(paramsrule, function(err,data){
        if(err){
            console.log(err);
            callback(err);
        }
        else {
            //console.log(data);
            const itemsrule = data.Items.map(
                (dataField)=>{
                   return {ruleid: dataField.ruleid.S, tax: +dataField.tax.S, servicecharge: +dataField.servicecharge.S, specialoffer: dataField.specialoffer.S}; 
                }
                );
//           callback(null, itemsrule);
            tax = itemsrule[0].tax;
            servicecharge = itemsrule[0].servicecharge;
            specialoffer = itemsrule[0].specialoffer;
           console.log("Hey got the price metadata" + itemsrule);   
        }
    })

///////////////////////////////////////////////////////////////
      
    const type = event.type;
    if (type == 'all'){
        const params = {
            TableName: "pricemaster"
        };
    
    dynamodb.scan(params, function(err,data){
        if(err){
            console.log(err);
            callback(err);
        }
        else {
            //console.log(data);
            const items = data.Items.map(
                (dataField)=>{
                   return {storeid: dataField.storeid.S, itemid: +dataField.itemid.S, price: +dataField.price.S, uom: dataField.uom.S}; 
                }
                );
               
               
                //Price Calculation & reponse structuring logic starts here
                console.log("Hey here ie event body" + event.orders[0].itemid); 
                let costtotal = 0;
                //let servicecharge =0;
                //let tax = 0;
                
                for (let billindex = 0; billindex < event.orders.length; billindex++) {
                     for (let priceindex = 0; priceindex < items.length; priceindex++) {
                             if (event.orders[billindex].itemid == items[priceindex].itemid ){
                                 
                                 console.log("Hey Success");
                                 console.log("Price of :" + event.orders[billindex].itemname + ":"  + event.orders[billindex].quantity * items[priceindex].price);
                                 costtotal = costtotal + (event.orders[billindex].quantity * items[priceindex].price);
                             } 
                          
                      
                   }    
                }
                console.log("Total Cost:" + costtotal);
                console.log("Tax:" + costtotal * tax);
                console.log("Service Chanrge: " + costtotal * servicecharge);
                let total = costtotal + (costtotal * tax) + (costtotal * servicecharge);
                total = round(total,2);
                event.total=total;
                event.tax= (costtotal * tax);
                event.servicecharge= (costtotal * servicecharge);
                //Price Calculation & response structuring logic ends here
           callback(null, event);
        }
    })
    }
    else if (type == 'single'){
        const params = {
            Key: {
                "regionid": {
                    S: "1"
                } 
            },
            TableName: "pricemaster"
        };
        
        dynamodb.getItem(params, function(err,data){
            if(err) {
                console.log("hey there is an error ~~~~~~~~", err);
            }
            console.log(data);
            callback(null,data);
        })
    }
   
};
