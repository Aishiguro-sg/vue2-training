/**
 * データフィルタ用オブジェクト
 */
const filters = {
  // すべてのタスクを表示する関数
  all(todos) {
    return todos;
  },
  // 未完了のタスクのみを表示する関数
  active(todos) {
    return todos.filter((todo) => !todo.completed);
  },
  // 完了したタスクのみを表示する関数
  completed(todos) {
    return todos.filter((todo) => todo.completed);
  }
};
// 上記の関数をエクスポート
export default filters;
//filtersの中身  all,active,completed