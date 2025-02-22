import React, { useState } from "react";
import "./App.css";

function App() {
  const [permission, setPermission] = useState(Notification.permission);

  const requestNotificationPermission = () => {
    if (permission === "default") {
      Notification.requestPermission().then((newPermission) => {
        setPermission(newPermission);
        if (newPermission === "granted") {
          console.log("通知が許可されました。");
        } else {
          console.log("通知が拒否されました。");
        }
      });
    }
  };

  const showNotification = () => {
    console.log("通知開始");
    if (permission === "granted") {
      console.log("通知許可確認");
      new Notification("テスト", {
        body: "This is a test of notification",
      });
    } else {
      console.log("通知が許可されていません。");
    }
  };

  return (
    <div className="App">
      {permission === "default" && (
        <button onClick={requestNotificationPermission}>通知を許可する</button>
      )}
      <button onClick={showNotification}>通知を表示する</button>
    </div>
  );
}

export default App;
