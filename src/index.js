import React from "react";
import ReactDOM from "react-dom";
import "./assets/styles.css";
import Upload from "./Upload";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
    <React.StrictMode>
        <Upload />
    </React.StrictMode>,
    document.getElementById("root")
);

serviceWorkerRegistration.register();