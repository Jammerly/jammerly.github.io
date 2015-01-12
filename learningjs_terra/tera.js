// 
//      -- (c) Copyright 2004,2012 Andrew Scott 
// 

var gameTop  = 200;   //  Position of playing area from window top
var gameWdth = 700;   //  Width of the playing area
var gameHght = 300;   //  Height of the playing area


var numalien = 10;          //  Number of aliens
var nummis   = 10;          //  Number of missiles to create



//--------- DON'T EDIT BELOW HERE unless you really want to play :) ---------//


var score    = 0;

var dispStart= 0;
var dispEnd  = gameWdth;

var scale    = Math.floor(gameHght / 3);       //  Scale all display elements
var blkWdth  = Math.floor(gameWdth / scale);   //  Width of blocks forming terrain
var numblks  = Math.floor(gameWdth / blkWdth);

var maxSpeed = 50;
var offset   = 0;      //  We offset display so player sees what's coming
var offsetLim= 100;    //  Don't let ship go too far toward edge of display

var ship     = null;          //  The actor containing the ship image
var land     = null;          //  The array of divs holding the land
var objs     = new Array();   //  An array of all movable objects (actors)

var mile     = new Array();   //  An array of missiles
var nxtmis   = 0;             //  Next available missile to fire

var alienF   = "tera-alien.gif";
var shipF    = "tera-ship.gif";
var missL    = "tera-rk-l.gif";  // Images for the missiles
var missR    = "tera-rk-r.gif";  // Both left and right images

var timer    = null;          //  Timer used for main game timing


//
//   Some functions to operate on DIVs
//   We could extend the DIV class but
//
//   These have been pulled out to allow the rest of
//   the code to be more implementation independent
//
function setH(o, v)     { o.style.height  =  v + "px"; }

function setY(o, v)     { o.style.top     =  v + "px"; }

function setX(o, v)     { o.style.left    = (v - dispStart) + "px"; }

function setV(o, v) {
   o.style.visibility = v ? "visible" : "hidden";
}

function setImage(o, f, w, h) {
   o.innerHTML =
      "<img src=\"" + f + "\" width=" + w + "px height=" + h + "px>";
}


//
//   Define an actor class
//   We use this as the basis for all moving objects
//   in the system: ships, missiles, etc.
//
function actor(e) {

   function P_setH(v) { setH    (this.htmlElem, v); }
   function P_setY(v) { setY    (this.htmlElem, v); }
   function P_setX(v) { setX    (this.htmlElem, v); }
   function P_setV(v) { setV    (this.htmlElem, v); }
   function P_setI(f) { setImage(this.htmlElem, f, this.width, this.height); }

   function P_motionX(v) {
      return v + this.speed;
   }

   function P_motionY(v) {
      return ++v;
   }

   function P_crash(retain, obj) {
      this.crashed = true;

      if (!retain)
         this.visible = false;
   }

   function P_move() {
      if (this.htmlElem == null)
         return;

      //
      //   Decrease speed -- simulate drag
      //
      if (this.speed > 0)
         --this.speed;

      else
         ++this.speed;


      if (this.fuel  > 0)
         --this.fuel;  // Burn some fuel

      if (this.fuel == 0)
         this.crash(this.retain, null);   // Out of fuel

      if (!this.crashed) {
         //
         //   Check actor hasn't hit the ground
         //
         if (this.visible && this.alt > (gameHght - terrainHeight(this.xpos)) )
            this.crash(this.retain, null);

         //
         //   ...or gone up too high
         //
         if (this.alt < this.height/2)
            this.alt = this.height/2;

         //
         //   Check actor hasn't moved off screen
         //
         if ((this.xpos < (dispStart + this.width)) ||
               (this.xpos > (dispEnd - this.width)))
            this.visible = false;

         else
            this.visible = true;

         //
         //   Check we've not hit any other actor
         //
         for (var i = 0; i < objs.length; i++) {
            //
            //   We can't crash into ourself or anything
            //   that's already crashed
            //
            if ((objs[i] == this) || objs[i].crashed)
               continue;

            //
            //   Actors don't kill their siblings
            //
            if (objs[i].type == this.type)
               continue;

            if ((Math.abs(this.xpos - objs[i].xpos) < this.width) &&
                  (Math.abs(this.alt - objs[i].alt) < this.height)) {

               this.crash(this.retain || objs[i].retain, objs[i]);
               objs[i].crash(this.retain || objs[i].retain, this);
            }
         }
      }

      this.setV(this.visible);
      this.setX(this.xpos - this.width/2);
      this.setY(this.alt  - this.height/2);

      if (!this.crashed) {
         //
         //   Move with actor's motion
         //
         this.alt  = this.motionY(this.alt );
         this.xpos = this.motionX(this.xpos);
      }
   }


   //
   // Make above methods public
   //
   this.setH     = P_setH;
   this.setY     = P_setY;
   this.setX     = P_setX;
   this.setV     = P_setV;
   this.setImage = P_setI;
   this.crash    = P_crash;
   this.move     = P_move;
   this.motionX  = P_motionX;
   this.motionY  = P_motionY;


   //
   //   Now for some default variables and values
   //
   this.alt      = 0;         // Altitude
   this.xpos     = 0;         // Location in window
   this.dir      = 1;         // Direction actor is travelling
   this.fuel     = 0;         // Amount of fuel
   this.speed    = 0;         // Speed actor is travelling
   this.value    = 0;         // Points we get for killing one of these actors

   this.width    = Math.floor(0.3 * scale);
   this.height   = Math.floor(0.3 * scale);

   this.retain   = false;     // Should we keep image after crash
   this.crashed  = false;
   this.visible  = false;     // Should object be displayed
   this.htmlElem = e || null;
   this.type     = "actor";
}




//
//   Define a missile class
//
function missile(e) {
   //
   //   Override base method
   //

   function P_crash(retain, obj) {
      if (obj)
         score += obj.value;

      this.crashed = true;

      if (!retain)
         this.visible = false;
   }

   this.crash    = P_crash;

   this.height   = Math.floor(0.15 * scale);
   this.htmlElem = e || null;
   this.type     = "missile";
}
missile.prototype = new actor();



//
//   Define an alien class
//
function alien(e) {
   //
   //   Override base methods
   //

   function P_motionX(v) {
      return v + Math.floor(Math.random() * 30) - 15;
   }

   function P_motionY(v) {
      v = v + Math.floor(Math.random() * 16) - 8;

      //
      //   Avoid the ground!
      //
      if (v > (gameHght - terrainHeight(this.xpos)) )
         v -= this.height;

      return v;
   }

   function P_crash(retain, obj) {
      if (!this.crashed)
         --numalien;

      this.crashed = true;

      if (!retain)
         this.visible = false;
   }

   this.motionX  = P_motionX;
   this.motionY  = P_motionY;
   this.crash    = P_crash;

   this.alt      = 100;
   this.fuel     = -1;         // Infinite fuel
   this.xpos     = Math.floor(Math.random() * gameWdth);
   this.value    = 200;
   this.visible  = true;
   this.htmlElem = e || null;
   this.type     = "alien";

   this.setImage(alienF);

   //
   //   Make sure aliens don't start under ship
   //   -- we have to give player a chance!
   //
   if (Math.abs(this.xpos - ship.xpos) < 100)
      this.xpos += 200;
}
alien.prototype = new actor();



//
//   terrainHeight(x)
//
//   A function that generates an interesting terrain
//   The parameter x is the x-position within the game
//
function terrainHeight(x) {
   var r = (x * 0.0025) % (2 * Math.PI);  // 360 degrees = 2PI radians;

   var height = Math.sin(r);

   height += 0.25 * Math.cos(3 * r);
   height += 0.3  * Math.sin(5 * r);

   height = Math.floor(height * scale);
   height = Math.abs(height);

   if (height < 30) height = 30;    // Minimum DIV height

   return height;
}



//
//   f()
//   General function called repeatedly to move all the
//   objects in the game.
//
function f() {
   dispStart = ship.xpos + offset - gameWdth/2;
   dispEnd   = dispStart + gameWdth;

   //
   //   Update the terrain
   //
   for (var i = 0; i < numblks; i++) { 

      var h = terrainHeight(dispStart + blkWdth*i);
 
      setH(land[i], h);
      setY(land[i], gameHght - h);
   }

   //
   //   Drift ship so player gets a better view of the terrain
   //
   if (ship.dir == 1) {
      if (offset < gameWdth/2 - offsetLim)
         offset += blkWdth;
   }

   else {
      if (offset > offsetLim - gameWdth/2)
         offset -= blkWdth;
   }


   //
   //   Update the position of all objects
   //
   for (var i = 0; i < objs.length; i++)
      objs[i].move();

   var s = document.getElementById("score");
   s.innerHTML = "Score: " + score;

   var d = document.getElementById("alienCount");
   d.innerHTML = "Aliens: " + numalien;


   if (ship.crashed || numalien <= 0)
      clearInterval(timer);  //  Stop the timer controlling the game

   if (ship.crashed)
      alert("You Crashed!");

   if (numalien == 0)
      alert("You saved the world!!!");
}
