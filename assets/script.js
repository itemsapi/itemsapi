var requestCatalog = function(data) {
  data = _.extend({
    success: function(result, status) {
      jQuery("#content").html(result);
      //History.pushState(null, document.title, decodeURIComponent(data.url));
      History.pushState(null, document.title, (data.url));
    },
    dataType: 'html'
  }, data);
  jQuery.ajax(data);
}


var onAggregationClick = function(element, aggregation, value) {

  var checked = jQuery(element).is(':checked');
  var uri = getUpdatedAggregationsUrl({
    key: aggregation,
    value: value,
    checked: checked
  });

  requestCatalog({
    url: uri.href()
  });
}

var aggregationTrigger = function(aggregation_name, value) {
  var uri = getUpdatedAggregationsUrl({
    key: aggregation_name,
    value: value,
    checked: true
  });

  requestCatalog({
    url: uri.href()
  });
}

var removeQuery = function() {

  var uri = URI();

  uri.removeSearch('query');
  $("#main_query").val('');

  requestCatalog({
    url: uri.href()
  });
}

var clearFilters = function() {

  var uri = URI();

  uri.removeSearch('query');
  uri.removeSearch('filters');
  uri.removeSearch('not_filters');
  uri.removeSearch('page');
  $("#main_query").val('');

  requestCatalog({
    url: uri.href()
  });
}

var addNotFilter = function(aggregation, value) {

  var uri = URI();

  var qs = uri.search(true);
  var not_filters = JSON.parse(qs.not_filters || '{}');

  not_filters[aggregation] = not_filters[aggregation] || [];
  not_filters[aggregation].push(value)
  not_filters[aggregation] = _.uniq(not_filters[aggregation]);

  qs.not_filters = JSON.stringify(not_filters);
  uri.search(qs);

  requestCatalog({
    url: uri.href()
  });
}

var removeNotFilter = function(aggregation, value) {

  var uri = URI();

  var qs = uri.search(true);
  var not_filters = JSON.parse(qs.not_filters || '{}');
  var index = not_filters[aggregation].indexOf(value);
  not_filters[aggregation].splice(index, 1);

  qs.not_filters = JSON.stringify(not_filters);
  uri.search(qs);

  requestCatalog({
    url: uri.href()
  });
}

var removeDeleted = function() {
  var uri = URI();

  uri.removeSearch('type');
  //$("#main_query").val('');

  requestCatalog({
    url: uri.href()
  });

  return false;
}

var removeFilter = function(key, value) {
  var uri = getUpdatedAggregationsUrl({
    key: key,
    value: value,
    checked: false
  });
  requestCatalog({
    url: uri.href()
  });
}

var getUpdatedAggregationsUrl = function(options) {
  var uri = options.uri || new URI();
  var qs = uri.search(true);
  var filters = JSON.parse(qs.filters || '{}');

  var aggregation = options.key;
  var value = options.value;
  var checked = options.checked;

  if (!filters[aggregation]) {
    filters[aggregation] = [];
  }

  var chunks = uri.path().split('/');

  //if (uri.path() !== '/catalog' && uri.path() !== '/' && uri.path().indexOf('/catalog/category') === -1) {
  //if (uri.path() !== '/catalog' && uri.path() !== '/') {
  if (uri.path().indexOf('/changelog') !== -1) {
    uri.path('/changelog');
  } else if (uri.path().indexOf('/catalog') === -1 && uri.path() !== '/') {
    uri.path('/catalog');
  }

  // add filter
  if (checked === true) {
    filters[aggregation].push(value)
    filters[aggregation] = _.uniq(filters[aggregation]);
  // remove filter
  } else {
    var index = filters[aggregation].indexOf(value);

    // index found
    if (index !== -1) {
      filters[aggregation].splice(index, 1);
    } else {
      // index not found so reset slug to category
      if (uri.path().indexOf('/changelog') !== -1) {
        uri.path('/changelog');
      } else {
        uri.path('/catalog');
      }
    }
  }

  qs.filters = JSON.stringify(filters);
  delete qs['page'];
  uri.search(qs);
  return uri;
}

jQuery(document).ready(function() {
  $('.previous-page').on('click', function(event) {
    History.back()
    event.preventDefault()
  })

  $(document).on('click', '.aggregation-box', function(event) {
    //event.preventDefault()
  })

  $( document ).ajaxError(function( event, request, settings ) {

    console.log('error')
    console.log(request.status)

    if (request.status === 401) {
      showLoginModal();
      //alert('please login')
      //window.location.href = '/login';
    }


    if (request.status === 403) {
      showSubscriptionModal();
      //alert('please login')
      //window.location.href = '/login';
    }
  });

  $('.loginRequired').on('click', function(event) {
    showLoginModal();
    event.preventDefault()
  })
})


/**
 * main query autocomplete
 */
jQuery(document).ready(function() {


  // turn off auto search because it's distracting me
  if ([].indexOf(URI().path()) !== -1) {

    console.log('autocomplete enabled')

    var myTimer = 0;
    $('#main_query').keyup(function() {
      var query = $(this).val()

      if (myTimer) {
        clearTimeout(myTimer);
      }

      myTimer = setTimeout(function() {

        var uri = URI();

        uri.removeSearch('query');
        uri.removeSearch('page');
        uri.addSearch('query', query);

        requestCatalog({
          url: uri.href()
        });
      }, 500);
    });

    $('#main_query').keypress(function (e) {
      if (e.which == 13) {
        e.preventDefault();
      }
    });

  }
})

$(document).on('change', '#select_per_page', function(event) {

  var uri = URI();
  uri.removeSearch('per_page');
  uri.addSearch('per_page', $(this).val());

  requestCatalog({
    url: uri.href()
  });
})

$(document).on('change', '#select_sorting', function(event) {

  var uri = URI();
  uri.removeSearch('sort');
  uri.addSearch('sort', $(this).val());

  requestCatalog({
    url: uri.href()
  });
})

