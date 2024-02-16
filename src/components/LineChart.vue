<template> 
  <div>
    <div>Vue + Canvas API</div> 
    <canvas id="mycanvas"></canvas> 
  </div>
</template>

<script>  
  
export default {
  name: "LineChart", 
  mounted() { 
        var c = document.getElementById("mycanvas");
        var ctx = c.getContext("2d");   
        var xvals = [100, 300, 400];
        var yvals = [50, 200, 150];     
        ctx.moveTo(xvals[0], yvals[0]);    
        ctx.lineTo(xvals[1], yvals[1]);    
        ctx.stroke();
  }
}
</script>