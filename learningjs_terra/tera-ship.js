// 
//      -- (c) 2004 Copyright Andrew Scott 
// 


var key      = 0;      //  Variable holding a mask of keys held down
var keyup    = 1;      //  Bit representing an up key in the above mask
var keydown  = 2;      //  ...and one for a down key
var keythrst = 4;

//
//   Define a ship class
//
function spacecraft(e) {

   function P_motionX(v) {

      if ((key & keythrst) && (Math.abs(this.speed) < maxSpeed))
         this.speed += (2 * this.dir);

      //return this.constructor.P_motionX.call(this, v);

      return v + this.speed;
   }

   function P_motionY(v) {
      //
      //   Check whether ship should move up or down
      //   Given the choice move up to avoid crashing
      //
      if (key & keyup)
         v -= 5;

      else if (key & keydown)
         v += 5;

      //return this.constructor.P_motionY.call(this, v);

      return ++v;
   }

   this.motionX  = P_motionX;
   this.motionY  = P_motionY;

   this.alt      = 100;
   this.fuel     = -1;         // Infinite fuel
   this.xpos     = gameWdth/2;
   this.retain   = true;
   this.visible  = true;
   this.htmlElem = e || null;
   this.type     = "ship";

   this.setImage(shipF);
}
spacecraft.prototype = new actor();



// 
//   Handle key presses 
//   Update prefered direction of movement 
//   based on key pressed. 
// 
//   Note we handle key repeats ourselves. The
//   normal repeat startup delay is too long.
//
function keyHandler(event) { 
   if (!event) event = window.event;

   var ret = false;
   switch (event.keyCode) {

      case 13:         // Return/ Enter key
         //
         //   Launch next available missile
         //
         with (mile[nxtmis]) {
            dir     = ship.dir;
            alt     = ship.alt;
            xpos    = ship.xpos + (2 * ship.width * dir);
            speed   = ship.speed + 50 * dir;
            fuel    = 10;
            crashed = false;
            visible = true;

            if (dir == 1)
               setImage(missR);

            else
               setImage(missL);
         }

         nxtmis = ++nxtmis % mile.length;
         break;

      case 32:         // Space bar
         ship.dir *= -1;
         break;

      case 38:         // Up arrow key 
      case 65:         // Letter A
         key |= keyup;
         break;

      case 40:         // Down arrow key
      case 90:         // Letter Z 
         key |= keydown;
         break;

      case 222:
         key |= keythrst;
         break;

      default: 
         ret = true;   // The event isn't for us
   } 

   return ret;
}

function keyCancel(event) { 
   if (!event) event = window.event;

   var ret = false;
   switch (event.keyCode) {
      case 38:           // Up arrow key 
      case 65:           // Letter A
         key ^= keyup;   // -- Reset bit
         break;

      case 40:           // Down arrow key
      case 90:           // Letter Z 
         key ^= keydown; //  -- Reset bit
         break;

      case 222:
         key ^= keythrst;
         break;

      default:
         ret = true;
   }

   return ret;
}
