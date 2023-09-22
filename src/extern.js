import filters from '@/filters.js';
/**
 * Vueオブジェクトの外部の影響を取り込むための変数定義
 */
const extern = {
    visibility: {
      value: "all"
    },
}

//hashchange イベントリスナー
window.addEventListener("hashchange", () => {

  // ハッシュの値を取得し、前後のスラッシュを削除
  const visibility = window.location.hash.replace(/#\/?/, "");

   // フィルターが定義されているかを確認
  if (filters[visibility]) {
    // 外部（extern）の visibility プロパティを設定
    extern.visibility.value = visibility;

     // ハッシュが無効またはフィルターが存在しない場合、デフォルトで "all" を設定
  } else {
    window.location.hash = "";
    extern.visibility.value = "all";
  }
});

export default extern;

