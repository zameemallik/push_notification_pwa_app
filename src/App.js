import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOSデバイスの検出
    const ua = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // スタンドアロンモード（ホーム画面から起動）の検出
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

    // 通常の通知APIをチェック
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationSupported(true);
      setPermission(Notification.permission);
    } else {
      console.log("このブラウザは通知APIをサポートしていません");
      setNotificationSupported(false);
    }

    // Push APIとService Workerのサポートをチェック (iOS 16.4+)
    const checkPushSupport = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        setPushSupported(true);
        console.log("Push APIがサポートされています");

        // Service Workerが登録されているか確認
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            console.log("既にプッシュ通知に登録されています");
          }
        } catch (e) {
          console.error("Service Worker/Push確認エラー:", e);
        }
      } else {
        console.log("Push APIはサポートされていません");
        setPushSupported(false);
      }
    };

    checkPushSupport();
  }, []);

  const requestNotificationPermission = () => {
    if (!notificationSupported) {
      console.log("通知APIはサポートされていません");

      // Push APIを試す
      if (pushSupported) {
        subscribeToPushNotifications();
        return;
      }
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

  // iOS 16.4+ 向けのプッシュ通知登録
  const subscribeToPushNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("このブラウザはプッシュ通知をサポートしていません");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // 権限リクエスト
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== "granted") {
        alert("プッシュ通知の権限が拒否されました");
        return;
      }

      // プッシュ通知の購読
      try {
        // 通常はサーバーのVAPIDキーが必要ですが、デモとしてダミーのキーを使用
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            "BLxFSgUy9VP_YK8fjnZ6-4JDM8c3iI8QhnXJbkF_NXoZS8TdCL7wJPonBQhKdNB3uxNJcNnRumXMFQg1UgJmFqc",
        });

        console.log("プッシュ通知購読成功:", subscription);
        alert("プッシュ通知が登録されました");

        // 通常はここでサブスクリプション情報をサーバーに送信します
        // sendSubscriptionToServer(subscription);
      } catch (err) {
        console.error("プッシュ通知購読エラー:", err);
        alert("プッシュ通知の登録に失敗しました: " + err.message);
      }
    } catch (err) {
      console.error("Service Worker準備エラー:", err);
    }
  };

  const showNotification = () => {
    console.log("通知開始");
    if (!notificationSupported && !pushSupported) {
      alert("このブラウザは通知をサポートしていません");
      return;
    }

    if (notificationSupported && permission === "granted") {
      console.log("通知許可確認");
      new Notification("テスト", {
        body: "This is a test of notification",
      });
    } else if (pushSupported) {
      // Service Workerを使った通知表示（iOS 16.4+向け）
      showPushNotification();
    } else {
      console.log("通知が許可されていません。");
      alert("通知が許可されていません");
    }
  };

  // Service Workerを使った通知の表示
  const showPushNotification = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification("PWAテスト通知", {
          body: "Service Workerからの通知です",
          icon: "/logo192.png",
          badge: "/logo192.png",
        });
      }
    } catch (err) {
      console.error("通知表示エラー:", err);
      alert("通知の表示に失敗しました");
    }
  };

  return (
    <div className="App">
      {isIOS && !isStandalone && (
        <div className="install-guide">
          <h2>ホーム画面に追加してください</h2>
          <p>
            このアプリをホーム画面に追加すると、プッシュ通知が利用できます。
          </p>
          <ol>
            <li>
              下部の「共有」ボタン<span className="icon">📤</span>をタップ
            </li>
            <li>「ホーム画面に追加」を選択</li>
            <li>右上の「追加」をタップ</li>
          </ol>
        </div>
      )}

      {!notificationSupported && !pushSupported && (
        <div className="error-message">
          <p>このブラウザは通知をサポートしていません</p>
          <p>
            Push通知を使用するには、サポートされているブラウザをご使用ください
          </p>
        </div>
      )}

      {(notificationSupported || pushSupported) && permission === "default" && (
        <button onClick={requestNotificationPermission}>通知を許可する</button>
      )}

      <h1>通知機能確認</h1>
      <button onClick={showNotification}>通知を表示する</button>

      <div className="status">
        <p>通知API対応: {notificationSupported ? "はい" : "いいえ"}</p>
        <p>Push API対応: {pushSupported ? "はい" : "いいえ"}</p>
        <p>通知許可状態: {permission}</p>
        <p>iOS端末: {isIOS ? "はい" : "いいえ"}</p>
        <p>ホーム画面から起動: {isStandalone ? "はい" : "いいえ"}</p>
      </div>
    </div>
  );
}

export default App;
