const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const app = express()

app.use(session({
  secret: "secret_of_outstanding#boy",
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

app.set('views', __dirname+'/views')
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname+'/public'));\
app.use(bodyParser.json());

function reload(req){
  const schedules = req.session.schedules;
  if(!schedules){
    return '';
  }else{
    let str = "";
    for(let id in schedules){
      const schedule = schedules[id];
      if(schedule.done){
        str+='<div class="todo_done">\
        <div id="todo_item_'+id+'" class="todo_done_box_container" onclick="undone('+id+')">\
        <div class="check_done">✓</div>\
        <p class="todo_what_done">'+schedule.what+'</p>\
        </div>\
        <div class="todo_done_btn_container">\
        <div id="btn_del_'+id+'" class="todo_done_btn_delete" onclick="del('+id+')">삭제</div>\
        </div>\
        </div>'
      }
      else{
        if(!schedule.edit){
          str+='<div class="todo">\
          <div id="todo_item_'+id+'" class="todo_box_container" onclick="done('+id+')">\
          <div class="check">✓</div>\
          <p class="todo_what">'+schedule.what+'</p>\
          </div>\
          <div class="todo_btn_container">\
          <div id="btn_edit_'+id+'" class="todo_btn_edit" onclick="edit('+id+')">수정</div>\
          <div id="btn_del_'+id+'" class="todo_btn_delete" onclick="del('+id+')">삭제</div>\
          </div>\
          </div>'
        }
        else{
          str+='<div class="todo_edit">\
          <div id="todo_edit_item_'+id+'" class="todo_edit_box_container">\
          <input id="edit_input_'+id+'" class="todo_edit_input" value="'+schedule.what+'">\
          <div id="btn_modify_'+id+'" class="todo_btn_modify" onclick="modify('+id+')">수정</div>\
          </div>\
          </div>'
        }
      }
    }
    return str;
  }
}

app.get('/', (req, res)=>{
  if(!req.session.schedules)
  req.session.schedules = [
      {
        "done": false,
        "edit": false,
        "what": "할 일을 입력하고 등록 버튼을 클릭하세요!"
      },
      {
        "done": true,
        "edit": false,
        "what": "등록된 일정을 클릭하면 체크(완료)됩니다!"
      },
      {
        "done": false,
        "edit": false,
        "what": "일정을 지우려면 삭제 버튼을 클릭하세요!"
      },
      {
        "done": false,
        "edit": false,
        "what": "일정을 수정하려면 수정 버튼을 클릭하세요!"
      },
    ]
  res.render('index')
})

app.post('/add', (req, res)=>{
  const body = req.body;
  const schedules = req.session.schedules;
  for(let schedule of schedules){
    if(schedule.what == body.what){
      res.send(JSON.stringify({"result":"faled", "reason":"이미 등록된 일정"}))
      return;
    }
  }
  schedules.push(body);
  req.session.schedules = schedules;
  res.send(JSON.stringify({"result":"success"}));
})

app.post('/edit', (req, res)=>{
  const id = req.body.id;
  const schedules = req.session.schedules;

  schedules[id].edit = true;
  req.session.schedules = schedules;
  res.send(JSON.stringify({"result":"success"}))
})


app.post('/modify', (req, res)=>{
  const body = req.body;
  const schedules = req.session.schedules;

  for(let id in schedules){
    if(schedules[id].what == body.what && id != body.id){
      res.send(JSON.stringify({"result":"faled", "reason":"이미 등록된 일정"}))
      return;
    }
  }

  schedules[body.id].what = body.what;
  schedules[body.id].edit = false;
  req.session.schedules = schedules;
  res.send(JSON.stringify({"result":"success"}))
})

app.post('/delete', (req, res)=>{
  const id = req.body.id;
  const schedules = req.session.schedules;
  schedules.splice(id, 1);
  req.session.schedules = schedules;
  res.send(JSON.stringify({"result":"success"}))
})


app.post('/done', (req, res)=>{
  const id = req.body.id;
  const schedules = req.session.schedules;
  schedules[id].done = true;
  req.session.schedules = schedules;
  res.send(JSON.stringify({"result":"success"}))
})
app.post('/undone', (req, res)=>{
  const id = req.body.id;

  const schedules = req.session.schedules;
  schedules[id].done = false;
  req.session.schedules = schedules;
  res.send(JSON.stringify({"result":"success"}))
})

app.post('/reload', (req, res)=>{
  const str = reload(req);
  res.send(str);
})

app.listen(3000, ()=>{
  console.log("서버가 3000번 포트에서 구동됩니다.\n --> http://localhost:3000");
})

exports.app = app
