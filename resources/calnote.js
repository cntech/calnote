angular.module('calnote', [])

angular.module('calnote').factory('aux', function() {
  var aux = {}
  
  var exists = function(object, path, create, array) {
    var next = path.shift()
    var subObject = object[next]
    if(typeof subObject !== 'undefined') {
      // sub-object exists
      if(path.length) {
        return exists(subObject, path, create)
      } else {
        // we encountered the inner-most item
        if(create) {
          return subObject
        } else {
          return true
        }
      }
    } else {
      // sub-object missing
      if(create) {
        object[next] = array? [] : {}
        var subObject = object[next]
        if(path.length) {
          return exists(subObject, path, create)
        } else {
          // we encountered the inner-most item
          return subObject
        }
      }
      return false
    }
  }
  aux.exists = function(object, path) {
    var arr = (typeof path === 'string')? path.split('.') : path
    return exists(object, arr)
  }
  aux.create = function(object, path, array) {
    var arr = (typeof path === 'string')? path.split('.') : path
    return exists(object, arr, true, array)
  }
  aux.localStorage = {
    // localStorage is the globally accessible browser storage
    write: function(key, data) {
      localStorage.setItem(key, JSON.stringify(data))
    },
    read: function(key) {
      console.log('read', key, localStorage, localStorage[key])
      return JSON.parse(localStorage[key] || '{}')
    }
  }
  
  aux.generateUid = function() {
    return (Math.random()*100000000000000000).toString()
  }
  
  return aux
})

angular.module('calnote').factory('db', function(aux) {
  var db = {
    name: 'calNote',
    types: {
      'Day': {
        table: 'days'
      },
      'Note': {
        table: 'notes'
      }
    }
  }
  
  db.getRoot = function() {
    db.cache = aux.localStorage.read(db.name)
    return db.cache
    //return aux.create(localStorage, [db.name])
  }
  
  var getContext = function(args) {
    var ctx = {}
    switch(args.length) {
    case 2: // two arguments
      var type = args[0]
      var table = db.types[type].table
      var third = args[1]
      var thirdName = (typeof third === 'function')? 'selector' : 'data'
      ctx.parent = aux.create(db.getRoot(), [table])
      ctx.type = type
      ctx[thirdName] = third
      break
    case 3: // three arguments
      var type = args[1]
      var table = db.types[type].table
      ctx.parent = args[0] || aux.create(db.getRoot(), [table])
      ctx.type = type
      ctx.selector = args[2]
      break
    case 4: // four arguments
      var type = args[1]
      var table = db.types[type].table
      ctx.parent = args[0] || aux.create(db.getRoot(), [table])
      ctx.type = type
      ctx.selector = args[2]
      ctx.data = args[3]
      break
    }
    return ctx
  }
  
  // var iterate = function(parent, type, selector) {
  //   var ctx = getContext(arguments)
  //   var table = db.types[type].table
  //   return parent[table].filter(selector)
  // }
  db.getTable = function(parent, type) {
    console.log('TYPE', type)
    var tableName = db.types[type].table
    return aux.create(parent, [tableName], true)
  }
  
  db.save = function() {
    aux.localStorage.write(db.name, db.cache)
  }
  
  db.create = function(parent, type, data) {
    var ctx = getContext(arguments)
    var table = db.getTable(ctx.parent, ctx.type)
    var result
    var newId
    do { // loop until the new id is really unique
      newId = aux.generateUid()
      result = table.filter(function(record) {
        return record.id == newId
      })
    } while(result.length)
    data.id = newId
    table.push(data)
    db.save()
  }
  
  db.get = function(parent, type, selector) {
    var ctx = getContext(arguments)
    var table = db.getTable(ctx.parent, ctx.type)
    console.log('TABLE', table)
    return table.filter(selector)
  }
  
  db.update = function(parent, type, selector, data) {
    var ctx = getContext(arguments)
    var table = db.getTable(ctx.parent, ctx.type)
    table.filter(selector).forEach(function(record) {
      console.log('update record', record)
      jQuery.extend(record, data)
    })
    db.save()
  }
  
  db.destroy = function(parent, type, selector) {
    var ctx = getContext(arguments)
    var table = db.getTable(ctx.parent, ctx.type)
    var inverseSelector = function(record) {
      return !selector(record)
    }
    var result = table.filter(inverseSelector)
    var tableName = db.types[ctx.type].table
    parent[tableName] = result
    db.save()
  }
  
  return db
})

angular.module('calnote').directive('day', function() {
  return {
    
  }
})

angular.module('calnote').directive('noteForm', function() {
  return {
    
  }
})
