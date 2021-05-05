if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
//Only uses "dotenv" when server is in development stage and not in production

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
//Access "STRIPE_SECRET_KEY" variable from ".env" file
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

console.log(stripeSecretKey, stripePublicKey)

const express = require("express")
const app = express()
const fs = require("fs")
const stripe = require("stripe")(stripeSecretKey)

app.set("view engine", "ejs")
//Frontend uses "ejs" to render views

app.use(express.json())
//Allows for parse of JSON and access as JSON. (Used in ".post" else statement below)

app.use(express.static("public"))

app.get("/store", function(req, res){
    fs.readFile("items.json", function(error, data) {
        if (error){
            res.status(500).end()
        }
        //Returns error status when neccessary

        else{
            res.render("store.ejs", {
                stripePublicKey: stripePublicKey,
                //Sends "stripePublicKey" var to "store.js" file
                items: JSON.parse(data)
            })
        }
        //Note: In order for this to work, need to change "store.html" to "store.ejs"
    })
})

app.post("/purchase", function(req, res){
    fs.readFile("items.json", function(error, data) {
        if (error){
            res.status(500).end()
        }
        //Returns error status when neccessary

        else{

            const itemsJson = JSON.parse(data)
            const itemsArray = itemsJson.medical_supplies.concat(itemsJson.general_supplies)
            //Merges "medical_supplies" with "general_supplies"

            let total = 0
            req.body.items.forEach(function(item) {
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id
                })
                total = total + (itemJson.price * item.quantity)
                //Adds bought item to "total". (Note: this method is much more secure then letting user access in frontend)
            })
            //Traverses items list and finds desire item that matches id

            stripe.charges.create({
                amount: total,
                //Note: total amount is in cents
                
                source: req.body.stripeTokenId,
                currency: "usd"
                //Sets parameters for charging the user through stripe
            }).then(function(){
                console.log("Charge Successful")
                res.json({message: "Purchase Success"})
                //Displays success message through pop-up in user browser
            }).catch(function() {
                console.log("Charge Fail")
                res.status(500).end()
            })
            //Catches error and returns error 500
            
            //Then-Catch functions also known as a "promise"
            //console.log("purchase")
        }
        //Note: In order for this to work, need to change "store.html" to "store.ejs"
    })
})

app.listen(3000)

//Note: File names in "public" have been modified to ensure "node server.js" command functions
//Reasons for these changes are currently unknown

//*Note: Secret API key found in Stripe account must remain secure, key used to directly charge customers so,
//if leaked, then third parties may charge customers
//This is why ".env" developer file is used to prevent third parties from accessing the secret key while allowing
//developers to use the secret key during development

//"items.json" file used to store id of items purchased. This way, users cannot exploit frontend system
//by changing purchase amount to $0.
//Also note that in real world application, prices of items in "items.json" should be in cents to guard against rounding errors