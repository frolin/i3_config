Vue.component("checkout",{props:["initChecked","id"],data:function(){return{checked:this.initChecked}},methods:{checkOnOff:function(){this.checked=!this.checked,this.$emit("check-on-off",this.checked)}},template:'<div class="cb-container">    <input type="checkbox" :id="id">    <label :for="id" class="cb-label"></label></div>'});