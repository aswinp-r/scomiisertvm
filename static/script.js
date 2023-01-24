
function inputBox(){
    let textinput = document.getElementById("user");
    let val =  textinput.value;
    let len =val.length;
    
   
    if (len == 10){
      if (checkCard(val)){
      document.getElementById("output").innerHTML = "PASS";
      bell.play()
    }
      else{document.getElementById("output").innerHTML = "FAIL";
          permissiondenied.play()
    }

      setTimeout(function(){document.getElementById("user").value = "";},800);
      setTimeout(function(){document.getElementById("output").innerHTML = "";},800);
    }
    else if(len > 10){document.getElementById("user").value = "";}
}  




function GetData(user,password){
    
    //Request json file containing the data of the cardnumbers
    let jsonreq = new XMLHttpRequest();
    jsonreq.onload = function(){ 
      try{
      try{
        var responseData  = this.responseText;
       
      }catch(error){alert("Invalid response from the server\nTry again later");return}
        //Decrypt the data
        try{

        var decrypted_data = decrypt(responseData,password)
        
        }
        catch(error){
          
          alert("User or password may be incorrect or try again later");return
        }
        //Parse the text into object
        try{
         
        var dataJSON = JSON.parse(decrypted_data);
        }catch(error){
          alert("User or password may be incorrect or try again later");return
        }
        try{
        if (dataJSON[user]===null || dataJSON[user]=="" || dataJSON[user].length ==0){
          alert("User or password may be incorrect or try again later");return
        }}catch(error){console.log(123);return;location.reload()}
        
        data = dataJSON[user]
        if(data === undefined){;return}
      }
      catch(error){alert(error);location.reload();return}
      directs()
    }

    jsonreq.open("GET","res/data.json");
    jsonreq.send();    
}


function decrypt(string,password){

try{
  var x =  CryptoJS.Rabbit.decrypt(string,password)
  return x.toString(CryptoJS.enc.Utf8)
}catch(error){throw "User or password may be incorrect or try again later"}
}



function checkCard(x){
        for(let i = 0;i<data.length;i++){
          if (x == data[i]){
            return true;
          }
        }
        return false;

    }
  

    function handleSubmit(form){
      
      var user = form.user.value
     
      var password = form.password.value
      
      if (user == "" || user === null ||password == "" || password === null){alert("User and password can't be empty");return}
      
       
       GetData(user,password)
    }
    


    function directs(){
        //Change h2
        document.querySelector("h2").innerHTML = "Id Card Tapping"
        //hide password input
       document.getElementById("pass").setAttribute("type","hidden")
       //Change value of the user input
       document.getElementById("user").value = ""
       document.getElementById("user").placeholder = "carnumber"
       document.getElementById("user").addEventListener('input',()=> inputBox())
       document.getElementById("user").focus()
       
       document.getElementById("sub").disabled = true
       document.getElementById("sub").setAttribute("type","hidden")
       document.querySelector("div").setAttribute('style',"height:160px;")

    }

 //Start the instance of audio alert
 bell = new Audio("res/bell.mp3");
 permissiondenied = new Audio("res/permissiondenied.mp3")
