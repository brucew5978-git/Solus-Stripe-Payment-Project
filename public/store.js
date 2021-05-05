if(document.readyState == "loading"){
    document.addEventListener("DOMContentLoaded" , ready)
}
else{
    ready()
}

/* if-else used to check if page has loaded before running the js file */

function ready() {

    var removeCartItemButton = document.getElementsByClassName("btnDanger")

    /*
        "document.getElementsByClassName()" gets all the elements of a certain class on a page

        "var" is variable in javaScript
    */ 

    console.log(removeCartItemButton)
    // Logs/writes the "removeCartItemButton" in the page script

    for(var i = 0; i < removeCartItemButton.length; i++){
        var button = removeCartItemButton[i]

        button.addEventListener('click', removeCartItem)
        // "button.addEventListener" will detect if the button was clicked or not
        //Calls "removeCartItem" function
    }   
    
    var quantityInput = document.getElementsByClassName("cartQuantityInput")
    for (var i = 0; i < quantityInput.length; i++){
        var input = quantityInput[i]
        input.addEventListener("change", quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName("shopItemButton")
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener("click", addToCartClicked)
    }

    document.getElementsByClassName("btnPurchase")[0].addEventListener("click", purchaseClicked)
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: "auto",
    //"locale" defines which language is used
    token: function(token){

        var items = []
        var cartItemContainer = document.getElementsByClassName("cartItems")[0]
        var cartRows = cartItemContainer.getElementsByClassName("cartRow")

        for(var index = 0; index < cartRows.length; index++){
            var cartRow = cartRows[index]
            var quantityElement = cartRow.getElementsByClassName("cartQuantityInput")[0]
            
            var quantity = quantityElement.value
            //Returns quantity value that user cna toggle while in the store page
            var id = cartRow.dataset.itemId

            items.push({
                id: id,
                quantity: quantity
            })

        }
        //console.log(token)

        fetch("/purchase", {
            method: "POST",
            //"POST" request allows user to send info to server in order for server to do certain calcs
            //This is unlike "GET" which expects server to give back info
            
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"

                //Tells server that expects input and output of info to be in json
            },

            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })

        }).then(function(res) {
            return res.json()
            //Only returns the JSON info from the server
        }).then(function(data){
            alert(data.message)

            var cartItems = document.getElementsByClassName("cartItems")[0]
            while(cartItems.hasChildNodes()){
                cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
            //Copied from alpha store, removes all items from cart after purchase
        }).catch(function(error) {
            console.error(error)
            //WHen error occurs, will only log the error and not process it. (Not covered in WBS tut)
        })
        //"fetch" command allows user to send info to backend while staying on the same page
    }
    //To check console, need to inspect page, should be a "object" under "Console"
})
/*
"StripeCheckout" is an object imported from the stripe library

Function allows for stripe info to be processed after user has entered necessary informtaion 
Note: This function is only called when user input information into system.

To test this function, enter any email and any info for date and CV, then use "4242 4242..." for card # - this is Stripe's test credit card #
*/
function purchaseClicked() {
    
    // alert("Transaction complete!")
    // var cartItems = document.getElementsByClassName("cartItems")[0]

    // while(cartItems.hasChildNodes()){
    //     cartItems.removeChild(cartItems.firstChild)
    // }

    // updateCartTotal()
    
    //Note: Fast comment command is Ctrl+K+C


    var priceElement = document.getElementsByClassName("cartQuantityInput")[0]
    
    /*
        var price = parseFloat(priceElement.innerText.replace("$", "")) * 100
        Above works for WDS tutorial only, replaces "$" with empty space so var can be used in calc
        Also, Stripe operates using cents so need to multiply by 100
        
        However, Solus site uses "#### Credits", so need to remove string: "Credits"
    */
    var price = parseFloat(priceElement.innerText.replace("Credits", ""))

    stripeHandler.open({
        amount: price
    })

}

function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    //Completely removes the "div" that contains the entire row of items in the button's row
        
    updateCartTotal()
}

function quantityChanged(event) {
    var input = event.target
    if(isNaN(input.value) || input.value <= 0) { //Checks if # in quantity slot is a number or is -ve
        input.value = 1
    }
    //Restricts user from entering quantity below 1

    updateCartTotal()
}

function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    //Reference to "cartItem" class

    var title = shopItem.getElementsByClassName("shopItemTitle")[0].innerText
    //Gets price from html file

    var price = shopItem.getElementsByClassName("shopItemPrice")[0].innerText
    //Gets price from html file

    var imageSrc = shopItem.getElementsByClassName("shopItemImage")[0].src

    console.log(title, price, imageSrc)

    var id = shopItem.dataset.itemId
    //ID var used in "token" function above to add costs
    addItemToCart(title, price, imageSrc, id)
    //calls "addItemToCart" method

    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, id) {
    //Function now passing "id" variable created in above function

    var cartRow = document.createElement("div")
    //Creates "div" element 
    cartRow.classList.add("cartRow")
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName("cartItems")[0]

    var cartItemNames = cartItems.getElementsByClassName("cartItemTitle")
    for (var i = 0; i < cartItemNames.length; i++) {
        if(cartItemNames[i].innerText == title) {
            alert("Item already added to cart")
            //Sends alert message to user

            return
            //exits the function, avoids making the same item
        }

        //for-loop checks if item has already been added to the cart
    }

    var cartRowContents = `
        <div class="cartItem cartColumn">
            <img class="cartItemImage" src = "${imageSrc}" width = "100" height= "100">
            <!-- "width" and "height" sets dimensions-->

            <span class="cartItemTitle">${title}</span>
        </div>
        <span class="cartPrice cartColumn">${price}</span>

        <div class="cartQuantity cartColumn">
            <input class="cartQuantityInput" type = "number" value = "1"> 
            <!-- Only allows input of numbers
                Note: "value" presets an input number
            -->  
            <button class="btn btnDanger" type="button">
                REMOVE
            </button>
        </div>   `
    
    //Note that `` is used instead of "" or ''
    // Anything under "${}" is a variable
    
    cartRow.innerHTML = cartRowContents
    cartItems.appendChild(cartRow)
    //Adds "div" to end of "cartItems"

    cartRow.getElementsByClassName("btnDanger")[0].addEventListener("click", removeCartItem)
    //Adds "remove" button for items created after "ready" function
    //Necessary as these functions were added after "ready" 

    cartRow.getElementsByClassName("cartQuantityInput")[0].addEventListener("change", quantityChanged)
    //Adds "quantity" function to items added after "ready"
}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName("cartItems")[0]
    var cartRows = cartItemContainer.getElementsByClassName("cartRow")
    var total = 0

    for (var i = 0; i < cartRows.length; i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName("cartPrice")[0]
        var quantityElement = cartRow.getElementsByClassName("cartQuantityInput")[0]
        
        console.log(priceElement, quantityElement)

        var price = parseFloat(priceElement.innerText.replace("Credits", ""))
        /*
            var price = pareseFloat(priceElement.innerText)
            console.log(price)
            Shows the "50 credits or the value indicated in the html code".
            
            However, adding ".replace" gets rid of "credits" from "50 credits"
            and parseFloat converts "50" from a string to an int.
          */
        

        var quantityElement = quantityElement.value
        //Used to calculate total price 

        
        total = total + (price * quantityElement)
        console.log("Total = " + total)
    }
    total = Math.round(total * 100) / 100
    //Rounds "total" to nearest 2 decimal places

    document.getElementsByClassName("cartTotalPrice")[0].innerText = total + " Credits"
}
