
function inputBox(){
    let textinput = document.getElementById("textinput");
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

      setTimeout(function(){document.getElementById("textinput").value = "";},800);
      setTimeout(function(){document.getElementById("output").innerHTML = "";},800);
    }
    else if(len > 10){document.getElementById("textinput").value = "";}
}  




function GetData(){
      
    //Request json file containing the data of the cardnumbers
    let jsonreq = new XMLHttpRequest();
    jsonreq.onload = function(){ 
        data  = this.responseText;
            
        //Parse the text into object
        data = JSON.parse(data);
    }

    jsonreq.open("GET","res/data.json");
    jsonreq.send();    
}



function checkCard(x){
        for(let i = 0;i<data.cdh1.length;i++){
          if (x == data.cdh1[i]){
            return true;
          }
        }
        return false;

    }


 //Start the instance of audio alert
 bell = new Audio("res/bell.mp3");
 permissiondenied = new Audio("res/permissiondenied.mp3")
 GetData()
