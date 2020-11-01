(function ($) {
  $.fn.serializeFormJSON = function () {

    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
})(jQuery);

$.ajaxSetup({
  beforeSend:function(){
    $(".ajax-loader").show();
  },
  complete:function(){
    $(".ajax-loader").hide();
  },
  error: function(jqXHR) {
    //console.log(jqXHR);
    //console.log('error');
  }
});

$(document).on('click', '.facet-name', function(event) {

  var content = $(this).next('ul');

  if (!content.is(':visible')) {
    content.show();
  } else {
    content.hide();
  }
  return false;
});


var showLoginModal = function() {
  $('#loginModal').modal({})
}

$('#generalModal').on('show.bs.modal', function () {
  // initialize tagsIt after modal is loaded
  //tagitInit('#tags-edit-tags', 'tags')
})

var currentItemId;

$('body').keydown(function(e) {

  if (currentItemId && $(".item-view").is(':visible')) {

    if (e.keyCode == 37) {
      navigateItem('left');
    }
    else if(e.keyCode == 39) {
      navigateItem('right');
    }
  }
});

var showItem = function (dataset_id, item_id) {

  if (item_id === undefined || dataset_id === undefined) {
    return false;
  }

  currentItemId = item_id;

  $.ajax({
    url: '/item/' + dataset_id + '/' + item_id,
    method: 'GET',
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}

var navigateItem = function(where) {

  var dataset_id = $('.table-items').attr('data-id');

  if (where === 'left') {
    var prevId = $(".table-items tr[data-id='" + currentItemId + "']").prev().attr('data-id');
    showItem(dataset_id, prevId)
  } else if (where === 'right') {
    var nextId = $(".table-items tr[data-id='" + currentItemId + "']").next().attr('data-id');
    showItem(dataset_id, nextId)
  }
}

var getDocument = function(dataset, id) {

  $.ajax({
    url: '/document/' + dataset + '/' + id,
    method: 'GET',
    success: function(data) {

      $('#modalContent').html(data);
      $('#generalModal').modal({})
    },
    error: function() {
      alert('An error occured. Probably missing data')
    }
  });

  return false;
}

var showModalFacet = function(index_name, name, page) {

  var uri = new URI();
  var qs = uri.search(true);
  var filters = JSON.parse(qs.filters || '{}');
  var query = qs.query || '';
  var not_filters = JSON.parse(qs.not_filters || '{}');
  var page = page || 1;

  $.ajax({
    url: '/dashboard/' + index_name + '/modal-facet/' + name,
    method: 'GET',
    data: {
      filters: filters,
      query: query,
      not_filters: not_filters,
      page: page
    },
    success: function(data) {
      $('#modalContent').html(data);
      $('#generalModal').modal({})
    }
  });

  return false;
}
