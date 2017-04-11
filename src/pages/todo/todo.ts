import './todo.scss';

import angularLibSample from '../../module';

interface ITodoItem {
    _id?: string;
    text: string;
    done?: boolean;
}

class TodoController {
    todoItems: ITodoItem[];
    doneItems: ITodoItem[];
    newItem: string;

    constructor(private $http: ng.IHttpService) { }

    async $onInit() {
        let resp = await this.$http.get<ITodoItem[]>('http://localhost:3000/todo');
        this.todoItems = resp.data.filter(item => !item.done);
        this.doneItems = resp.data.filter(item => item.done);
    }

    async createItem() {
        let newItem = {
            text: this.newItem
        };
        
        let resp = await this.$http.post<ITodoItem>('http://localhost:3000/todo', newItem);

        this.todoItems.push(resp.data);
        this.newItem = '';
    }

    async done(item: ITodoItem) {
        item.done = true;

        await this.$http.post<ITodoItem>('http://localhost:3000/todo', item);

        let index = this.todoItems.indexOf(item);
        this.todoItems.splice(index, 1);

        this.doneItems.push(item);
    }

    async doneAll() {
        let list = this.todoItems.slice();
        for (let item of list) {
            await this.done(item);
        }
    }

    async remove(item: ITodoItem) {
        await this.$http.delete<ITodoItem>('http://localhost:3000/todo/' + item._id);
    
        let index = this.doneItems.indexOf(item);
        this.doneItems.splice(index, 1);
    }
}

angularLibSample.config(router);

/* @ngInject */
function router ($stateProvider: ng.ui.IStateProvider) {
    $stateProvider.state('todo', {
        url: '/todo',
        template: require('./todo.html'),
        controller: TodoController,
        controllerAs: '$ctrl'
    });
}
