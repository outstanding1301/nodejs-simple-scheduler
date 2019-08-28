const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express()

app.set('views', __dirname+'/views')
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname+'/public'));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const initdb = {
  "schedules": [
    {
      "done": false,
      "edit": false,
      "what": "할 일을 입력하고 등록 버튼을 클릭하세요!"
    },
    {
      "done": true,
      "edit": true,
      "what": "등록된 일정을 클릭하면 체크(완료)됩니다!"
    },
    {
      "done": false,
      "edit": false,
      "what": "일정을 지우려면 삭제 버튼을 클릭하세요!"
    },
  ]
}

fs.exists(__dirname+'/db', (exists)=>{
  if(!exists){
    console.log("[!] 일정이 존재하지 않습니다. 일정을 생성합니다.")
    fs.writeFile(__dirname+'/db', JSON.stringify(initdb), (err)=>{});
  }else{
    console.log("[!] 일정이 존재합니다. 불러옵니다.")
  }
})

function reload(){
  let data = fs.readFileSync(__dirname+'/db')
    const json = JSON.parse(data);
    const schedules = json.schedules;
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
  const date = new Date();
  const strfm = ""+date.getFullYear()+"년 "+(date.getMonth()+1)+"월 "+date.getDate()+"일";
  res.render('index', {date:strfm})
})

app.post('/add', (req, res)=>{
  const body = req.body;
  fs.readFile(__dirname+'/db', (err, data)=>{
    const json = JSON.parse(data);
    const schedules = json.schedules;
    for(let schedule of schedules){
      if(schedule.what == body.what){
        res.send(JSON.stringify({"result":"faled", "reason":"이미 등록된 일정"}))
        return;
      }
    }
    schedules.push(body);
    fs.writeFile(__dirname+'/db', JSON.stringify({"schedules":schedules}), (err)=>{
      if(err){
          res.send(JSON.stringify({"result":"faled", "reason":"등록 실패!"}))
      }else{
          res.send(JSON.stringify({"result":"success"}))
      }
    })
  })
})

app.post('/edit', (req, res)=>{
  const id = req.body.id;
  fs.readFile(__dirname+'/db', (err, data)=>{
    const json = JSON.parse(data);
    const schedules = json.schedules;

    schedules[id].edit = true;

    fs.writeFile(__dirname+'/db', JSON.stringify({"schedules":schedules}), (err)=>{
      if(err){
          res.send(JSON.stringify({"result":"faled", "reason":"수정 실패!"}))
      }else{
          res.send(JSON.stringify({"result":"success"}))
      }
    })
  })
})


app.post('/modify', (req, res)=>{
  const body = req.body;
  fs.readFile(__dirname+'/db', (err, data)=>{
    const json = JSON.parse(data);
    const schedules = json.schedules;

    for(let id in schedules){
      if(schedules[id].what == body.what && id != body.id){
        res.send(JSON.stringify({"result":"faled", "reason":"이미 등록된 일정"}))
        return;
      }
    }

    schedules[body.id].what = body.what;
    schedules[body.id].edit = false;
    fs.writeFile(__dirname+'/db', JSON.stringify({"schedules":schedules}), (err)=>{
      if(err){
          res.send(JSON.stringify({"result":"faled", "reason":"수정 실패!"}))
      }else{
          res.send(JSON.stringify({"result":"success"}))
      }
    })
  })
})

app.post('/delete', (req, res)=>{
  const id = req.body.id;
  fs.readFile(__dirname+'/db', (err, data)=>{
    const json = JSON.parse(data);
    const schedules = json.schedules;
    schedules.splice(id, 1);
    fs.writeFile(__dirname+'/db', JSON.stringify({"schedules":schedules}), (err)=>{
      if(err){
          res.send(JSON.stringify({"result":"faled", "reason":"삭제 실패!"}))
      }else{
          res.send(JSON.stringify({"result":"success"}))
      }
    })
  })
})


app.post('/done', (req, res)=>{
  const id = req.body.id;
  fs.readFile(__dirname+'/db', (err, data)=>{
    const json = JSON.parse(data);
    const schedules = json.schedules;
    schedules[id].done = true;
    fs.writeFile(__dirname+'/db', JSON.stringify({"schedules":schedules}), (err)=>{
      if(err){
          res.send(JSON.stringify({"result":"faled", "reason":"체크 실패!"}))
      }else{
          res.send(JSON.stringify({"result":"success"}))
      }
    })
  })
})
app.post('/undone', (req, res)=>{
  const id = req.body.id;
  fs.readFile(__dirname+'/db', (err, data)=>{
    const json = JSON.parse(data);
    const schedules = json.schedules;
    schedules[id].done = false;
    fs.writeFile(__dirname+'/db', JSON.stringify({"schedules":schedules}), (err)=>{
      if(err){
          res.send(JSON.stringify({"result":"faled", "reason":"체크해제 실패!"}))
      }else{
          res.send(JSON.stringify({"result":"success"}))
      }
    })
  })
})

app.post('/reload', (req, res)=>{
  const str = reload();
  res.send(str);
})

app.listen(3000, ()=>{
  console.log("서버가 3000번 포트에서 구동됩니다.\n --> http://localhost:3000");
})

exports.app = app

/*
<div class="todo">
  <div class="todo_box_container">
   <div class="check">✓</div>
    <p class="todo_what">오늘 할 일 입니다.</p>
  </div>
  <div class="todo_btn_container">
    <div class="todo_btn_edit">수정</div>
    <div class="todo_btn_delete">삭제</div>
  </div>
</div>

<div class="todo_done">
  <div class="todo_done_box_container">
   <div class="check_done">✓</div>
    <p class="todo_what_done">오늘 한 일 입니다.</p>
  </div>
  <div class="todo_done_btn_container">
    <div class="todo_done_btn_delete">삭제</div>
  </div>
</div>
*/
