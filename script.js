/*
	1. 首先先預想我們會從使用者那邊獲取什麼藥的資訊，該用什麼資料型態儲存。
	2. 記得資料跟畫面渲染要分開處理。
	3. 使用者按下submit按鈕會發生哪幾件事情？
		a.資料：我們會獲得使用者提供的資料 ，我們會將這資料儲存在瀏覽器端
		b.畫面：畫面上的元素會全部清空，為了日後決定誰是acitve方便
		c.畫面：列表上產生新的列表項目項目(最新的會在最下面)
*/
// Elements Selection
const listForm = document.querySelector('[data-list-form]');
const listInput = document.querySelector('[data-list-input]');
const listContainer = document.querySelector('[data-list-container]');
const taskTitle = document.querySelector('[data-task-title]');
const taskContainer = document.querySelector('[data-task-container]');
const taskForm = document.querySelector('[data-task-form]');
const taskInput = document.querySelector('[data-task-input]');
const taskTemplate = document.getElementById('task-template');
const taskCount = document.querySelector('[data-task-count]');
const filter = document.querySelector('[data-filter]');

//Delete Elements Selection
const clearCompletedBtn = document.querySelector('[data-clear-completed]');


// LocalStorage
const LOCAL_STORAGE_LIST_KEY = 'todos.key';
let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
const LOCAL_STORAGE_SELECTED_LIST_KEY = 'todos.selectedId';
let selectedId = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_KEY));


// Events
//點擊到link時，保留相應的task 完成狀態。
filter.addEventListener('click', event => {
	const { target } = event;
	const filterLinks = document.querySelectorAll('.task-filter > li > a');
	const selectedList = todos.find(todo => todo.id === selectedId);

	if (target.tagName.toLowerCase() === 'a') {
		event.preventDefault();

		filterLinks.forEach(filterLink => {
			filterLink.removeAttribute('data-state');
		})

		if (target.innerText === 'All') {
			target.setAttribute('data-state', 'active');
			selectedList.tasks.forEach(task => {
				const uncompletedInput = document.getElementById(task.id);
				uncompletedInput.parentElement.style.display = '';
			});
			return;
		}

		if (target.innerText === 'Active') {
			target.setAttribute('data-state', 'active');
			selectedList.tasks.forEach(task => {
				const uncompletedInput = document.getElementById(task.id);
				if (task.completed === false) {
					uncompletedInput.parentElement.style.display = '';
				} else {
					uncompletedInput.parentElement.style.display = 'none';
				}
			});
			return;
		}

		//當選取到的link為
		if (target.innerText === 'Completed') {
			target.setAttribute('data-state', 'active');
			console.log(target);
			return;
		}

	}
})


clearCompletedBtn.addEventListener('click', event => {
	const { target } = event;
	if (target.classList.contains('btn-delete-task')) {
		const selectedList = todos.find(todo => todo.id === selectedId);
		console.log(selectedList);
		const completedTasks = selectedList.tasks.filter(task => task.completed === true);
		completedTasks.forEach(completedTask => {
			const completedTaskIndex = selectedList.tasks.indexOf(completedTask);
			selectedList.tasks.splice(completedTaskIndex, 1);
			saveAndRender();
			updateTaskCount(selectedList);
		})
	}
})


taskContainer.addEventListener('click', event => {
	const { target } = event;
	const selectedList = todos.find(todo => todo.id === selectedId);

	if (target.tagName.toLowerCase() === 'input') {
		const selectedTask = selectedList.tasks.find(task => task.id === target.id);
		selectedTask.completed = target.checked;
		updateTaskCount(selectedList);
	}

	if (target.tagName.toLowerCase() === 'button') {
		const selectedTask = selectedList.tasks.find(task => task.id === target.previousElementSibling.htmlFor);
		const selectedIndex = selectedList.tasks.indexOf(selectedTask);
		selectedList.tasks.splice(selectedIndex, 1);
		saveAndRender();
		updateTaskCount(selectedList);
	}
})

taskForm.addEventListener('submit', event => {
	event.preventDefault();
	const selectedList = todos.find(todo => todo.id === selectedId);
	const taskValue = taskInput.value;
	if (taskValue === '' || taskValue == null) return;
	const task = processTask(taskValue);
	taskInput.value = null;
	selectedList.tasks.push(task);
	updateTaskCount(selectedList);
	saveAndRender();
})

listContainer.addEventListener('click', event => {
	const { target } = event;
	if (!target.classList.contains('list-item')) return;
	selectedId = target.dataset.id;
	saveAndRender();
})

listForm.addEventListener('submit', event => {
	event.preventDefault();
	const inputValue = listInput.value;
	if (inputValue === '' || inputValue == null) return;
	const todo = processList(inputValue);
	listInput.value = null;
	todos.push(todo);
	save();
	renderList();
})

// Functions
// 將從使用者端獲取的資訊加工成符合我們需要的格式
function processList(name) {
	return { id: Date.now().toString(), name: name, tasks: [] };
}

function processTask(name) {
	return { id: Date.now().toString(), name: name, completed: false };
}

function saveAndRender() {
	save();
	renderList();
	render();
}

//將資訊儲存到client端
function save() {
	localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(todos));
	localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_KEY, JSON.stringify(selectedId));
}

//將右側task渲染到畫面上
/*
1.我們要先知道是哪一個list被選中
2.被選中的list，其title會出現在taskcontainer的title上。
3.也要去想，若沒有任何list被選中，畫面會是怎樣的一番情形
*/
function render() {
	const selectedList = todos.find(todo => todo.id === selectedId);
	if (selectedId == null) {
		resetTaskDivision();
	} else {
		taskTitle.innerText = selectedList.name;
		renderTask(selectedList);
	}
}

//將元素渲染到畫面上
function renderList() {
	clearElement(listContainer);
	todos.forEach(todo => {
		const listItem = document.createElement('li');
		listItem.classList.add('list-item');
		listItem.dataset.id = todo.id;
		listItem.innerText = todo.name;
		listItem.setAttribute('data-active', 'false');
		if (todo.id === selectedId) {
			listItem.setAttribute('data-active', 'true');
		}
		listContainer.appendChild(listItem);
	})
}

function renderTask(selectedList) {
	clearElement(taskContainer);
	selectedList.tasks.forEach(task => {
		const taskItem = document.importNode(taskTemplate.content, true);
		const checkbox = taskItem.querySelector('[type="checkbox"]');
		const label = taskItem.querySelector('label');
		const taskName = document.createTextNode(task.name);
		checkbox.id = task.id;
		label.htmlFor = task.id;
		label.appendChild(taskName);
		taskContainer.appendChild(taskItem);
	})
}

/*
以下情況需要更新item的數目
1.按下submit新增一個項目時，數字需要立即加一
2.按下task-item時，數字需要立即減一
*/
function updateTaskCount(selectedList) {
	const completedTasks = selectedList.tasks.filter(task => task.completed === false);
	taskCount.innerText = completedTasks.length > 1 ?
		`${completedTasks.length} items left` : `${completedTasks.length} item left`;

}

function resetTaskDivision() {
	taskTitle.innerText = '';
	clearElement(taskContainer);
}

//清除list上既有的element
function clearElement(container) {
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
}

// Function Invocations
renderList();

render();
