/* Checking privileges to display menu */

var NS_PRIVILEGES = {
		priv_list:[1,2,3,4,5,6,7,8],
		loadPrivileges:function(roleId){
			var self = this;
			//$.ajax({
				
				//url:'/user/fetchPrivilegesForRole',
				//dataType: 'json',
				//success:function(data){
					//if(data != undefined){
						//self.priv_list = data;
					//}
				
				//}
			//})
			//data = {"1,2,3,4,5,6,7,8"};
			
			//self.priv_list = data;
				self.init();
		},
		addMenu:function(htmlStr,id,loadAreaId){
			if (id != undefined && id > 0){
				$.each(this.priv_list,function(index,val){					
					if (id === val){
						$('#'+loadAreaId).append(htmlStr);
					}
				});
			}						
		},
		init:function(){
			addSidebar();
		}
}; 

