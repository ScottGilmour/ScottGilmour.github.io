$(document).ready(function() {
	main.initialize();
	//main.getHistory();
});


var main = {
	url : 'http://query.yahooapis.com/v1/public/yql',
	startDate : '2015-01-01',
	endDate : '2015-03-01',
	chartStartDate : '2015-01-01',
	chartEndDate : '2015-06-06',
	minCandleHeight : '50',
	chart : null,
	
	initialize : function() {
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
	        		main.createChart(json.query.results.quote);	
	        	}
		});
	},

	createChart : function( data ) {
		var margin = {top: 20, right: 30, bottom: 30, left: 40},
    		width = screen.width - margin.left - margin.right,
    		height = 700 - margin.top - margin.bottom,
    		barHeight = 10;

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

		console.log(min_domain + ', ' + max_domain);

		var timeFormat = d3.time.format('%Y-%m-%d');

		var timeScale = d3.time.scale()
							.domain([timeFormat.parse(main.chartStartDate), timeFormat.parse(main.chartEndDate)])
							.range([0, width])
							.nice();

		var yScale = d3.scale.linear()
    		.range([height, 0])
    		.domain([min_domain, max_domain]);

		var yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")
		    .tickSize(-width-100, 0, 0);

		var xAxis = d3.svg.axis()
			.scale(timeScale)
			.orient("bottom")
			.tickSize(-height, 0, 0);
    	

		var chart = d3.select(".chart")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .append("g")
    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		    chart.append('g')
		    	.attr('class', 'grid y axis')
		    	.call(yAxis);

		    chart.append('g')
		    	.attr('class', 'grid x axis')
		    	.attr('transform', 'translate(0,650)')
		    	.call(xAxis);

		    chart.append('bars');

		var bar = chart.selectAll('bars')
						.data( data )
						.enter().append('g')
						.attr('transform', function ( d, i ) {
							if (d.Open >= d.Close) {
								return 'translate(' + timeScale(timeFormat.parse(d.Date)) + ', ' + yScale(d.Open) +')';	
							} else {
								return 'translate(' + timeScale(timeFormat.parse(d.Date)) + ', ' + yScale(d.Close) +')';	
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
								return ((d.Open - d.Close) * 2)+(main.minCandleHeight) + 'px';
							} else {
								return ((d.Close - d.Open) * 2)+(main.minCandleHeight) + 'px';
							}
						});


			/*
			bar.append('text')
				.attr('x', 2)
				.attr('y', function (d, i) {
					return yScale(d.Open) / 2;
				})
				.attr("dy", ".15em")
				.text(function (d, i) {
					return d.Open.substr(0, 3);
				});
			*/




	
	}




};