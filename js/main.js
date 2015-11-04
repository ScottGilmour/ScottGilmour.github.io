$(document).ready(function() {
	main.initialize();
	//main.getHistory();
});


var main = {
	url : 'http://query.yahooapis.com/v1/public/yql',
	startDate : '2015-01-01',
	endDate : '2015-06-01',
	chartStartDay : 01,
	chartStartMonth : 01,
	chartStartYear : 2015, 
	chartStartDate : null,
	chartEndDate : '2015-06-06',
	minCandleHeight : '5',
	chart : null,
	xAxis : null,
	timeScale : null,
	timeFormat : null,
	margin : null,
	width : null,
	height : null,
	barHeight : null,
	yScale : null,
	data : null,
	
	initialize : function() {
		main.chartStartDate = main.chartStartYear + '-' + main.chartStartMonth + '-' + main.chartStartDay;

		$('.chart').on('mousewheel', function(event) {

		    if (event.deltaY > 0) {
		    	main.chartStartDay++;
		    	if (main.chartStartDay > 30) {
		    		main.chartStartDay = 0;
		    		main.chartStartMonth++;
		    		if (main.chartStartMonth > 12) {
		    			main.chartStartMonth = 0;
		    			main.chartStartYear++;
		    		}
		    	}

		    	main.chartEndDay--;
		    	if (main.chartEndDay < 0) {
		    		main.chartEndDay = 30;
		    		main.chartEndMonth--;
		    		if (main.chartEndMonth < 0) {
		    			main.chartEndMonth = 12;
		    			main.chartEndYear--;
		    		}
		    	}
		    } else {
		    	main.chartStartDay--;
		    	if (main.chartStartDay < 0) {
		    		main.chartStartDay = 30;
		    		main.chartStartMonth--;
		    		if (main.chartStartMonth < 0) {
		    			main.chartStartMonth = 12;
		    			main.chartStartYear--;
		    		}
		    	}
		    }

		    main.chartStartDate = main.chartStartYear + '-' + main.chartStartMonth + '-' + main.chartStartDay;
	    	main.timeScale.domain([main.timeFormat.parse(main.chartStartDate), main.timeFormat.parse(main.chartEndDate)]);

			var xAxis = d3.svg.axis()
						.scale(main.timeScale)
						.orient("bottom")
						.tickSize(-main.height, 0, 0);


			main.chart.selectAll('.x.axis')
	    		.call(xAxis);

	    	$('.ticker').empty();

	    	main.createBars(main.data);
		});

		$('#btn_chart').click(function( event ) {
	        event.preventDefault();

	        $('#search_field').addClass('disabled loading');
	        $('#btn_chart').addClass('disabled');

	        var symbol = $('#symbol_search_input').val().toUpperCase();

	        if (symbol) {
	        	main.getHistory(symbol);	
	        }
	    });

	},

	getHistory : function(symbol) {
		var data = encodeURIComponent('select * from yahoo.finance.historicaldata where symbol in ("' + symbol + '") and startDate = "' + main.startDate + '" and endDate = "' + main.endDate + '"');
		
		$.getJSON(main.url, 'q=' + data + "&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json", function(json, textStatus) {
				$('#search_field').removeClass('disabled loading');
	        	$('#btn_chart').removeClass('disabled');
				
	        	if (json.query.results) {
	        		$('.chart').empty();
	        		main.data = json.query.results.quote;
	        		main.createChart(main.data);	
	        		main.createBars(main.data);	
	        	}
		});
	},

	createChart : function( data ) {
		main.margin = {top: 20, right: 30, bottom: 30, left: 40},
    		main.width = screen.width - main.margin.left - main.margin.right,
    		main.height = 700 - main.margin.top - main.margin.bottom,
    		main.barHeight = 10;

    	var max_val = d3.max(data, function (d) {
			return d.Open;
		});

		var min_val = d3.min(data, function (d) {
			return d.Open;
		});

		var max_domain = max_val * (1.2);
		var min_domain = min_val * (0.8);
		if (min_domain < 0)
			min_domain = 0;

		var timeFormat = d3.time.format('%Y-%m-%d');
			main.timeFormat = timeFormat;

		var timeScale = d3.time.scale()
							.domain([timeFormat.parse(main.chartStartDate), timeFormat.parse(main.chartEndDate)])
							.range([0, main.width]);

			main.timeScale = timeScale;

		var yScale = d3.scale.linear()
    		.range([main.height, 0])
    		.domain([min_domain, max_domain]);

		var yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")
		    .tickSize(-main.width-100, 0, 0);

		    main.yScale = yScale;
		    main.xAxis = xAxis;

		var xAxis = d3.svg.axis()
			.scale(main.timeScale)
			.orient("bottom")
			.tickSize(-main.height, 0, 0);
    	

		var chart = d3.select(".chart")
		    .attr("width", main.width + main.margin.left + main.margin.right)
		    .attr("height", main.height + main.margin.top + main.margin.bottom)
		    .append("g")
    		.attr("transform", "translate(" + main.margin.left + "," + main.margin.top + ")");

		    chart.append('g')
		    	.attr('class', 'grid y axis')
		    	.call(yAxis);

		    chart.append('g')
		    	.attr('class', 'grid x axis')
		    	.attr('transform', 'translate(0,650)')
		    	.call(xAxis);

		    chart.append('bars');

		    main.chart = chart;
	},

	createBars : function(data) {
		var bar = main.chart.selectAll('bars')
						.data( data )
						.enter().append('g')
						.attr('class', 'ticker')
						.attr('transform', function ( d, i ) {
							if (d.Open >= d.Close) {
								return 'translate(' + main.timeScale(main.timeFormat.parse(d.Date)) + ', ' + main.yScale(d.Open) +')';	
							} else {
								return 'translate(' + main.timeScale(main.timeFormat.parse(d.Date)) + ', ' + main.yScale(d.Close) +')';	
							}	
						})
						.append('rect')
						.attr('id', function ( d, i ) {
							if (d.Open >= d.Close) {
								return 'bear';
							} else {
								return 'bull';
							}
						})
						.attr('width', function (d) {
							return '5px';
						})
						.attr('height', function (d) {
							if (d.Open >= d.Close) {
								var height = (d.Open - d.Close)*2;

								if (height <= main.minCandleHeight) height = main.minCandleHeight;
								return height + 'px';
							} else {
								var height = (d.Close - d.Open)*2;

								if (height <= main.minCandleHeight) height = main.minCandleHeight;
								return height + 'px';
							}
						});

	}
};
