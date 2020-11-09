'use strict'
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'us-west-2'});

exports.handler = function (event, context, callback)  {
    var params ={
        Item: {
            "storeid": {
                S: event.storeid
            },
            "itemid":{
                S: event.itemid
            },
            "price": {
                S: event.price
            },
            "uom": {
                S: event.uom
            }
            
        },
         TableName: "pricemaster"
       
    };
      dynamodb.putItem(params,function(err,data){
        callback(err,data);
      })
  }