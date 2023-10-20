import { jwtDecode } from "./jwt.decode.js";

let accessToken = "";
let api_url = "/api";
let idOfTask = null; 
let tasks=[];
let urgentTaskCount = 0;

const btnNav=document.getElementById('btn-nav')
const btnAdd=document.getElementById('btn-add')
const btnLoad=document.getElementById('btn-load')
const btnClose=document.querySelectorAll('.btn-close')
const btnReg = document.getElementById("registration");
const btnLog = document.getElementById("login");



const myModal = document.getElementById("myModal");
const myModalAdd = document.getElementById("myModalAdd");


const formTask=document.getElementById('taskForm')
const formTaskAdd=document.getElementById('taskFormAdd')


const divReg = document.getElementById("div-registration");
const formReg = document.getElementById("form-registration");

const divLogin = document.getElementById("div-login");
const formLogin = document.getElementById("form-login");
const pStatus = document.getElementById("login-status");
const sortBar=document.getElementById("sort-task")
const helloTitle = document.getElementById("hello-title");

let showPanel = (bShow, modal,form, valueTitle='', valueDescription='', deadline) => {
  bShow ? (modal.style.display = "flex") : (modal.style.display = "none");

  if(form && valueTitle && valueDescription && deadline) {
    console.log(valueTitle.value ,valueDescription.value,deadline)
    let deadlineDate = new Date(deadline);
    let isoString = deadlineDate.toISOString();
    let dateOnly = isoString.slice(0,10);
    form.title.value = valueTitle;
    form.description.value = valueDescription;
    form.deadline.value = dateOnly;
  }
};

// let showLoginPanel = (bShow) => {
//   bShow ? (divLogin.style.display = "flex") : (divLogin.style.display = "none");
// };

btnReg.onclick = () => {
  showPanel(true,divReg),showPanel(false,divLogin);
};
btnLog.onclick = () => {
  showPanel(false,divReg), showPanel(true,divLogin);
};
btnNav.onclick=()=>{
  showPanel(true,divLogin)
}
btnAdd.onclick=()=>{
  showPanel(true,myModalAdd)
}


btnLoad.onclick=()=>{
  location.reload()
}

btnClose.forEach((btn) => {
  btn.onclick= () => {
    showPanel(false, btn.parentElement.parentElement)
    checkAndClearForm(btn.parentElement)
  }
})

document.querySelector('#sort-task').addEventListener('change', function(event) {
  let value = event.target.value;
  const token=localStorage.getItem("token")
  renderTasks(token, value); // you might need to replace undefined with actual token
});


if (formReg && formReg.name && formReg.password && formReg.email) {
  formReg.onsubmit = async (e) => {
    e.preventDefault();
    const registrationDetails = await registration({
      name: formReg.name.value,
      email: formReg.email.value,
      password: formReg.password.value,
    });
    if (registrationDetails.error) {
      pStatus.innerText = registrationDetails.error;
      return;
    }
    // accessToken = registrationDetails.accessToken;
    // const jwtDecoded = jwtDecode(accessToken);
    helloTitle.innerHTML = `Вы зарегистрировали </br> Привет ${formReg.name.value} `;
    showPanel(false,divReg);
  };
} else {
  console.error("Form or some of its fields cannot be found");
}

if (formLogin && formLogin.email && formLogin.password) {
  formLogin.onsubmit = async function (e)  {
    e.preventDefault();
    const loginDetails = await login({
      email: formLogin.email.value,
      password: formLogin.password.value,
    });
    if (loginDetails.error) {
      pStatus.innerText = loginDetails.error;
      return;
    }
    accessToken = loginDetails.accessToken;
    localStorage.setItem('token',loginDetails.accessToken)
    const jwtDecoded = jwtDecode(accessToken);
    helloTitle.innerHTML = `Вы вошли </br> Привет ${jwtDecoded.name} </br>` 
    + `Количество срочных задач: ${urgentTaskCount} `;
    const tasks = await renderTasks();
  
    showPanel(false,divLogin);
  };
} else {
  console.error("Form or some of its fields cannot be found");
}

async function login(data) {
  const res = await fetch(`${api_url}/auth/login`, {
    method: "POST",
    credentials: "include",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

async function registration(data) {
  const res = await fetch(`${api_url}/auth/registration`, {
    method: "POST",
    credentials: "include",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

//RELOAD PAGE


window.addEventListener('load',async function reload(){
  const storedToken=localStorage.getItem('token')
  if(storedToken){
    console.log(storedToken)
    accessToken = storedToken;
    await login({token: storedToken});
    await renderTasks(storedToken);
  }
})

//CLEAR FORM
function checkAndClearForm(form) {
  // Проверяем, заполнены ли поля
  if (form.title.value !== "") {
    // Очищаем поля
    form.title.value = "";
    form.description.value = "";
    form.deadline.value=new Date();
  } 
}

///GET TASKS

async function getTasks(){
  try {


    const res = await fetch(`${api_url}/task`, {
      method: "GET",
      credentials: 'include',
      cache: "no-cache",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    });

    if (!res.ok) {
      throw new Error('Network response was not ok ' + res.status);
    }

    const data = await res.json();
    console.log(data)

    return data;  
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

async function renderTasks(token, sortBy){
  let tasks=await getTasks()


  if (sortBy === "date-create") {
    tasks.sort((a, b) => new Date(b.created) - new Date(a.created)); 
    urgentTaskCount=0// not sure about "created". It depends on your tasks structure
  } else if (sortBy === "date-deadline") {
    tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    urgentTaskCount=0
  }
  
  let taskIdArray = []; 

  const taskContainer=document.getElementById('tasks')
  const taskTemplate=document.getElementById('task-template')
  taskContainer.innerHTML = '';

  const currentTime = new Date();



  tasks.forEach(task=>{

    const taskClone=taskTemplate.content.cloneNode(true)
    const taskBg=taskClone.querySelector('.task');
    taskClone.querySelector('.task-title').textContent=task.title
    taskClone.querySelector('.task-description').textContent = task.description;
    const deadline=new Date(task.deadline)

    const timeDifference =Math.abs( deadline - currentTime);
    const differenceInDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    
   
    if (task.status === false && differenceInDays < 2) {
      urgentTaskCount++;
    }

    
    
    
    taskClone.querySelector('.task-date').textContent = deadline.toLocaleDateString();

    const btnDel=taskClone.querySelector('.delete-task-btn')
    btnDel.addEventListener('click',()=>deleteTask(task.id))

    const btnStatus=taskClone.querySelector('.status-btn')
    btnStatus.addEventListener('click', ()=>changeStatus(task, taskBg, btnStatus) )
    
    const bntEdit=taskClone.querySelector('.edit-task-btn')
    bntEdit.addEventListener('click',()=>{idOfTask = task.id; showPanel(true,myModal,formTask,task.title,task.description,task.deadline)

    })

    

    const savedTaskStatus = localStorage.getItem(task.id);


    if(savedTaskStatus !== null){
      if(savedTaskStatus === "true") {
        taskBg.style.backgroundColor = "lightgreen";
        task.status = true;
        btnStatus.innerHTML="&#10007;"
      } else {
        taskBg.style.backgroundColor = "white";
        task.status = false;
        btnStatus.innerHTML="&#10003;"
      }
    }
    taskContainer.appendChild(taskClone);

    taskIdArray.push(task.id);
   

  })




  // localStorage.setItem('taskIds', JSON.stringify(taskIdArray));
 
  btnAdd.style.display='flex';
  btnNav.style.display='none';
  btnLoad.style.display='flex'
  const jwtDecoded = jwtDecode(accessToken);
  helloTitle.innerHTML = `Вы вошли </br> Привет ${jwtDecoded.name} </br>` 
  + `Количество срочных задач: ${urgentTaskCount} `
  
  sortBar.style.display='flex';


}



//ADD TASK

  

async function sendTask(data){
  const res=await fetch(`${api_url}/task-add`, {
    method: 'POST',
    credentials: "include",
    cache: 'no-cache',
    headers:{
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),

  })
  return await res.json();
}

if (formTaskAdd && formTaskAdd.title && formTaskAdd.deadline) {
  formTaskAdd.onsubmit = async (e) => {
    e.preventDefault();
    const taskDetails = await sendTask({
      title: formTaskAdd.title.value,
      description: formTaskAdd.description ? formTaskAdd.description.value : '',
      deadline: formTaskAdd.deadline.value,
    });
    checkAndClearForm()
    if (taskDetails.error) {
      pStatus.innerText = taskDetails.error;
      return;
    }
    

  };

} else {
  console.error("Task form or some of its fields cannot be found");
}


//DEL 

async function deleteTask (id){
  const response = await fetch(`${api_url}/task/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    
  });
  if (response.ok) {
   
  } else {
    console.log(`Запрос не прошел элемента под id ${id} нет`)
  }
};


//STATUS

function changeStatus(task,  taskElement , btnStatus){
  if (taskElement === undefined) {
    console.error('taskElement is undefined');
    return;
  }
  else{
    console.log("Все работает"+ task.status) 
  }

  switch (task.status){
    case false: taskElement.style.backgroundColor = ("lightgreen")
    task.status=true;
    btnStatus.innerHTML="&#10007;"
    break 
    case true: taskElement.style.backgroundColor = ("white")
    task.status=false;
    btnStatus.innerHTML="&#10003;"
    break
  }

  saveStatus(task.id,task.status)
  
}

function saveStatus(id,status){
  if (typeof(Storage) !== "undefined") {
   
    localStorage.setItem(id, status);
} else {
    console.error('Не работает localeStorage..');
}
}


//EDIT
async function editTask(id,data){
  console.log(id)
  const res=await fetch(`${api_url}/task/${id}`, {
    method: 'PUT',
    credentials: "include",
    cache: 'no-cache',
    headers:{
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),

  })
  return await res.json();
}

if (formTask && formTask.title && formTask.deadline) {
  formTask.onsubmit = async (e) => {
    e.preventDefault();
    const taskDetails = await editTask(idOfTask,{
      title: formTask.title.value,
      description: formTask.description ? formTask.description.value : '',
      deadline: formTask.deadline.value,
    });
    checkAndClearForm()
    if (taskDetails.error) {
      pStatus.innerText = taskDetails.error;
      return;
    }
    

  };

} else {
  console.error("Task form or some of its fields cannot be found");
}



