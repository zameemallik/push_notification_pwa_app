import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    // ブラウザが通知をサポートしているか確認
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationSupported(true);
      setPermission(Notification.permission);
    } else {
      console.log("このブラウザは通知をサポートしていません");
      setNotificationSupported(false);
    }
  }, []);

  const requestNotificationPermission = () => {
    if (!notificationSupported) {
      console.log("通知はサポートされていません");
      return;
    }

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
    if (!notificationSupported) {
      alert("このブラウザは通知をサポートしていません");
      return;
    }

    if (permission === "granted") {
      console.log("通知許可確認");
      new Notification("テスト", {
        body: "This is a test of notification",
      });
    } else {
      console.log("通知が許可されていません。");
      alert("通知が許可されていません");
    }
  };

  return (
    <div className="App">
      {!notificationSupported && (
        <div className="error-message">
          <p>このブラウザは通知をサポートしていません</p>
          <p>
            Push通知を使用するには、サポートされているブラウザをご使用ください
          </p>
        </div>
      )}

      {notificationSupported && permission === "default" && (
        <button onClick={requestNotificationPermission}>通知を許可する</button>
      )}

      <h1>通知機能確認</h1>
      <button onClick={showNotification}>通知を表示する</button>

      <div className="status">
        <p>通知サポート: {notificationSupported ? "はい" : "いいえ"}</p>
        <p>通知許可状態: {permission}</p>
      </div>
    </div>
  );
}

export default App;
