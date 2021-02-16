import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import * as Minio from "minio";
import { v4 as uuid } from "uuid";

const BucketName = "transfer";

function Upload() {
    const [file, setFile] = useState(null);
    const [client, setClient] = useState(null);
    const [isCopying, setIsCopying] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(new URL(document.URL).searchParams.get("link"));

    useEffect(() => {
        const minioClient = new Minio.Client({
            endPoint: "localhost",
            port: 9000,
            useSSL: false,
            accessKey: "minio",
            secretKey: "password",
        });

        setClient(minioClient);
    }, [setClient, setDownloadUrl]);

    const onUpload = (e) => {
        e.preventDefault();
        setIsUploading(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            const fileNameFragments = file.name.split(".");
            const fileExtension = fileNameFragments[fileNameFragments.length - 1];
            const newFileName = `${uuid()}.${fileExtension}`;
            const buffer = Buffer.from(new Uint8Array(e.target.result));

            client.putObject(BucketName, newFileName, buffer, (err, etag) => {
                if (!!err) {
                    console.log(err);
                    return;
                }

                client.presignedUrl("GET", BucketName, newFileName, 24 * 60 * 60, (err, presignedUrl) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    setDownloadUrl(presignedUrl);

                    const url = new URL(document.URL);
                    url.searchParams.set("link", presignedUrl);
                    document.location.href = url.href;
                });
            });
        };

        reader.readAsArrayBuffer(file);
    };

    useEffect(() => {
        if (isCopying) {
            const el = document.getElementById("download-url-input");
            el.select();
            el.setSelectionRange(0, 99999);

            document.execCommand("copy");
            setIsCopying(false);
        }
    }, [isCopying, setIsCopying]);

    return (
        <main className="flex flex-column">
            <div className="container flex flex-column m-auto bg-white shadow p-5 rounded">
                {!downloadUrl ? (
                    <>
                        <h1 className="mt-0">
                            Datei
                            <br />
                            hochladen
                        </h1>

                        <form onSubmit={onUpload} className="w-full flex flex-column">
                            {!isUploading && (
                                <Dropzone
                                    onDrop={(acceptedFiles) => {
                                        setFile(acceptedFiles[0]);
                                    }}
                                >
                                    {({ getRootProps, getInputProps }) => (
                                        <section>
                                            <div className="file-upload rounded border" {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p>Klicken oder Datei hineinziehen um hochzuladen.</p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            )}
                            <button type="submit" className="btn mx-auto" disabled={!file || !!isUploading}>
                                Hochladen
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h1 className="mt-0">
                            Datei
                            <br />
                            laden
                        </h1>

                        <input
                            id="download-url-input"
                            type="url"
                            className="w-100 input-download-url"
                            value={document.URL}
                            disabled={!isCopying}
                        />

                        <button className="mb-3" onClick={() => setIsCopying(true)}>
                            Link kopieren
                        </button>

                        <a href={downloadUrl} className="btn mx-auto">
                            Herunterladen
                        </a>
                    </>
                )}
            </div>
        </main>
    );
}

export default Upload;
