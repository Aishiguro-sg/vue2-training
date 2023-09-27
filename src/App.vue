<template>
  <section class="todoapp">
    <!-- タイトル -->
    <header class="header">
      <h1>todos</h1>
      <input class="new-todo" autofocus autocomplete="off" 
             placeholder="終わらせたいタスクを入力" v-model="newTodo" 
             @keyup.enter="addTodo"/>
    </header>

    <main class="main" v-show="todos.length" v-cloak>
      <!-- タイトル -->
      
        <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone"/>
        <label for="toggle-all"></label>
      <!-- タスク一覧 -->
      <ul class="todo-list">
        
        <li class="todo"
            v-for="todo in filteredTodos" 
            :key="todo.id" 
            :class="{ completed: todo.completed, editing: todo == editedTodo }">
          <div class="view">
             <!-- 完了済み チェックボックスを追加 -->
            <input class="toggle" type="checkbox" v-model="todo.completed" @change="toggleCompleted(todo)" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>

            <!-- お気に入り チェックボックスを追加 -->
            <input v-if="!todo.completed" class="favorite" type="checkbox" v-model="todo.favorite"/>

            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input class="edit" 
                 type="text" 
                 v-model="todo.title" 
                 v-todo-focus="todo == editedTodo" 
                 @blur="doneEdit(todo)" 
                 @keyup.enter="doneEdit(todo)" 
                 @keyup.esc="cancelEdit(todo)"/>
        </li>
      </ul>
    </main>

    <footer class="footer" v-show="todos.length" v-cloak>
      <!--
        TODO件数、フィルタボタン配置予定個所   1.完了してないタスクの数
        class="selected" @click="filterTodos('all')"
        class @click="filterTodos('active')"
        class @click="filterTodos('completed')"
      -->   
        <span class="todo-count">残り <strong>{{ remaining }}</strong> 個</span>
        <ul class="filters">
          <li>
            <a href="#/all">全て</a>
          </li>
          <li>
            <a href="#/active">実践中</a>
          </li>
          <li>
            <a href="#/completed">完了済</a>
          </li>
          <li class="today">
            <a href="#/mark">今日中</a>
          </li>
        </ul>
      <!---->
      <button class="old" @click="showDeleted">
              履歴
      </button>
      <button class="clear-completed" @click="removeCompleted" 
              v-show="todos.length > remaining">
              完了済み削除
      </button>
    </footer>
  </section>
</template>

<script>
import todoStorage from '@/storage.js';
// import todoStorage from '@/storage.js';
import filters from '@/filters.js';
import extern from '@/extern.js';

let uniq_id = 0;

export default {
  name: 'App',

  components: {
    /* 今回は未使用 */
  },

  data() {
    return {
      todos: [],
      newTodo: "",
      editedTodo: null,
      visibility: extern.visibility,
      // 削除したデータの履歴
      deletedTodos:[],
      //お気に入り

    };
  },
  //2.呼び出すタイミング・自動保存
  created() {
    // モジュールからデータを読み込むタイミング
    this.todos = todoStorage.fetch();
  },
  watch: {
    // todosデータが変更されたときに呼び出されるウォッチャー
    todos: {
      handler(todos) {
        // データが変更されたら保存する
        todoStorage.save(todos);
      },
      deep: true, // 寸前に変更された細かいデータ(ネスト)も監視
    },
  },
  // 3.ボタン事にリストを条件振り分け
  computed: {

    filteredTodos() {
      // すべて
    if (this.visibility.value === 'all') {
      //return this.todos; 
      return filters.all(this.todos);

      // 未完了
    }else if (this.visibility.value === 'active') {
      return filters.active(this.todos);
      

       // 完了
    }else if (this.visibility.value === 'completed') {
      return filters.completed(this.todos);
    
    // お気に入り
    }else{
      return filters.favorite(this.todos);
    }
  },

    remaining() {
      return filters.active(this.todos).length;
    },

    allDone: {
      get() {
        return this.remaining === 0;
      },
      set(value) {
        this.todos.forEach(function(todo) {
          todo.completed = value;
        });
      }
    }
  },

  // データ処理用メソッド
  // ※ここではDOM操作しないでください。
  methods: {

    addTodo() { //文字列の前後にある空白文字（スペース、タブ、改行など）を削除する
      var value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }

      this.todos.push({
        id: uniq_id++,
        title: value,
        completed: false,
        favorite:false
      });
      this.newTodo = "";
    },

    removeTodo(todo) {
      // 削除するデータを履歴リストの末尾に追加
      this.deletedTodos.push(todo);
      //idが間違ったもの以外を返す
      this.todos = this.todos.filter((t) => t.id !== todo.id);
    },

  editTodo(todo) {
    this.beforeEditCache = todo.title;
    this.editedTodo = todo;
  },

  toggleCompleted(todo) {
    todo.favorite = false;
    // 完了済みが選択された場合、お気に入りのチェックボックスを無効にする
  },





    doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },

    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },
    
    //未完了のタスクのみを残す
    removeCompleted() {
      this.deletedTodos = filters.completed(this.todos);
      this.deletedTodos=[...this.deletedTodos,...filters.completed()];
     this.todos = filters.active(this.todos);
    },

    showDeleted() {
      // 削除したリストをコンソールに表示
      console.log(this.deletedTodos);
    },
    
  },
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://v2.vuejs.org/guide/custom-directive.html
  directives: {
    "todo-focus": (el, binding) => {
      if (binding.value) {
        el.focus();
      }
    }
  }
}
</script>
