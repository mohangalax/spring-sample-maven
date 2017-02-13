//Spinner setting
var opts = {
   		  lines: 11, // The number of lines to draw
   		  length: 14, // The length of each line
   		  width: 7, // The line thickness
   		  radius: 17, // The radius of the inner circle
   		  corners: 1, // Corner roundness (0..1)
   		  rotate: 0, // The rotation offset
   		  direction: 1, // 1: clockwise, -1: counterclockwise
   		  color: '#000', // #rgb or #rrggbb or array of colors
   		  speed: 1, // Rounds per second
   		  trail: 60, // Afterglow percentage
   		  shadow: false, // Whether to render a shadow
   		  hwaccel: false, // Whether to use hardware acceleration
   		  className: 'spinner', // The CSS class to assign to the spinner
   		  zIndex: 2e9, // The z-index (defaults to 2000000000)
   		  top: '50%', // Top position relative to parent in px
   		  left:'50%', // Left position relative to parent in px
   		  position: 'absolute',
   		  display: 'block'
};

var target = document.getElementById('search-spinner');
var spinner = new Spinner(opts).spin(target);

//Abort when cancel button is clicked in the progress screen. 
$('#search-modal').on('click', '.btn-primary', function() {
    if (typeof $ !== "undefined" && $.fn.dataTable) {
        var all_settings = $($.fn.dataTable.tables()).DataTable().settings();
        for (var i = 0, settings; (settings = all_settings[i]); ++i) {
            if (settings.jqXHR)
                settings.jqXHR.abort();
        }
    }
});