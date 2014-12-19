// 
//      -- (c) Copyright 2004 Andrew Scott 
// 


// 
//   findElements(className)  
//
//   This function creates an array of elements
//   by filtering the document divs matching className
//
function findElements(className) { 
   var divs = document.getElementsByTagName("div");
   var tiles = new Array(0); 


   for (var i = 0; i < divs.length; i++) { 
      if (divs[i].className == className) 
         tiles.push(divs[i]); 
   } 

   return tiles; 
}



//
//   newDiv()
//
//   Create a HTML DIV element of the named class
//
function newDiv(className) {
   var body = document.getElementById("defender");
   var div  = document.createElement("div");

   div.className = className;
   div.style.position = "absolute";

   body.appendChild(div);

   return div;
}


//
//   init_game()
//   The main initialisation function
//   This is the first function to be called and it
//   creates all the objects and the terrain
//
function init_game() {

   document.writeln("<span id=\"score\" style=\"font-size: 18pt\"></span>&nbsp;");
   document.writeln("<span id=\"alienCount\" style=\"font-size: 18pt\"></span>");

   //
   //   Create a box around the playing area
   //
   document.writeln("<div id=\"defender\" style=\"height: " + (gameHght+10) + "px; ");
   document.write("position: absolute; top: " + gameTop + "px; left: 50px; ");
   document.write("background-color: white; ");
   document.write("width: " + (12+gameWdth) + "px; border: solid\" >");

   //
   //   Create the terrain
   //
   for (var i = 0; i < numblks; i++) {
      document.writeln("<div class=\"land\" style=\"position: absolute; ");
      document.write("left: " + (2+i*blkWdth) +"px; background-color: green; ");
      document.write("width: " + blkWdth + "px\" >");
      document.writeln("</div>");
   }

   document.writeln("</div>");  // Box around playing area

   land = findElements("land");

   //
   //   Fill in the Arrays holding the actors
   //
   ship = new spacecraft(newDiv("ship"));
   objs.push(ship);

   for (var i = 0; i < numalien; i++)
      objs.push(new alien(newDiv("alien")));

   for (var i = 0; i < nummis; i++) {
      var m = new missile(newDiv("missile"));
      mile.push(m);
      objs.push(m);
   }

   //
   //   Link up handlers to deal with key presses
   //
   document.onkeydown = keyHandler;
   document.onkeyup   = keyCancel;

   timer = setInterval("f()", 100);  //  Repeatedly call f()
}
