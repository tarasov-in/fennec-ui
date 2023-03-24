import React, { useCallback, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { Button, Modal } from 'antd';
import { Field, useAuth, useUserContext } from 'fennec-ui';
import Icofont from 'react-icofont';
import { SwapOutlined } from '@ant-design/icons';
import { UserAddOutline } from 'antd-mobile-icons'

var _ = require('lodash');

export default function ImageEditor(props) {
    const { item, value, onChange, onAfterChange, open, close } = props;

    const auth = useAuth();
    const user = useUserContext();

    const [object, setObject] = useState({
        angle: 0,
    });

    const [canvas, setCanvas] = useState();
    const [photo, setPhoto] = useState();
    const canvasSize = 1200;

    const preparePhoto = (photo) => {
        photo.centeredScaling = true;
        photo.lockScalingFlip = true
        photo.transparentCorners = false;
        photo.borderColor = 'black'
        photo.cornerColor = 'black'
        photo.cornerStrokeColor = 'black'
        photo.cornerSize = 40
        photo.setControlVisible('ml', false)
        photo.setControlVisible('mb', false)
        photo.setControlVisible('mr', false)
        photo.setControlVisible('mt', false)
        // photo.setControlVisible('mtr', false)
        photo.controls.mtr.offsetY = -25
        photo.controls.mtr.render = function (ctx, left, top, styleOverride, fabricObject) {
            var image = new Image(50, 50), x, y;
            image.src = '/resources/ui-rotation.svg';
            x = left - image.width / 2;
            y = top - image.height / 2;
            ctx.drawImage(image, x, y, 50, 50);

            // styleOverride = styleOverride || {};
            // fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
        }

        photo.on('mousewheel', function (e) {
            if (e && e.e) {
                e.e.preventDefault();
                if (e.e.deltaY < 0) {
                    zoomIn(photo);
                } else if (e.e.deltaY > 0) {
                    zoomOut(photo);
                }
            }
        });

        photo.controls.mtr.mouseUpHandler = function (e, transform) {
            if (transform && transform.target) {
                var angle = transform.target.angle || 0;
                if (angle > 180) {
                    angle -= 360
                }
                setObject(o => ({ ...o, angle: angle }))
            }
        };
    }

    const triggerChange = useCallback(() => {
        if (onChange) {
            let b64 = canvas.toDataURL({
                format: 'png',
                left: 0,
                top: 0,
                width: canvasSize,
                height: canvasSize
            });

            var blobBin = atob(b64.split(',')[1]);
            var array = [];
            for (var i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            var file = new Blob([new Uint8Array(array)], { type: 'image/png' });
            onChange(file)

            // canvas.toBlob((blob) => {
            //     let file = new File([blob], "fileName.jpg", { type: "image/jpeg" })
            //   }, 'image/jpeg');

        }
    }, [canvas, onChange]);

    const createCanvas = () => {
        let canvas = new fabric.Canvas('canvas', {
            height: canvasSize,
            width: canvasSize,
            backgroundColor: 'white',
            alignSelf: "center",
        });

        const csize = "300px";
        canvas.lowerCanvasEl.style.width = csize;
        canvas.lowerCanvasEl.style.height = csize;
        canvas.upperCanvasEl.style.width = csize;
        canvas.upperCanvasEl.style.height = csize;
        canvas.wrapperEl.style.width = csize;
        canvas.wrapperEl.style.height = csize;

        canvas.allowTaint = true;
        // canvas.foreignObjectRendering = true;
        // canvas.preserveObjectStacking = true;
        setCanvas(canvas);

        if (value && _.isString(value)) {
            fabric.Image.fromURL(value, function (img) {
                const properties = img.set({
                    originX: "center",
                    originY: "center",
                    left: canvasSize / 2,
                    top: canvasSize / 2,
                });
                properties.scaleToWidth(canvasSize, false);
                properties.set('selectable', true);
                preparePhoto(img)
                setPhoto(img);
            }, { crossOrigin: 'Anonymous' });
        }

    }

    useEffect(() => {
        if (open) {
            // setTimeout(() => { createCanvas(); }, 100)
            createCanvas();
        }
    }, [open])

    const zoomIn = (photo) => {
        if (!photo.canvas) {
            return
        }

        var scaleVal = 50 / (photo.width || 1);
        photo.scaleY += scaleVal
        photo.scaleX += scaleVal
        photo.canvas.renderAll();
    }
    const zoomOut = (photo) => {
        if (!photo.canvas) {
            return
        }

        var scaleVal = 50 / (photo.width || 1);
        photo.scaleY -= scaleVal
        photo.scaleX -= scaleVal
        photo.canvas.renderAll();
    }
    const flipX = (photo) => {
        if (!photo.canvas) {
            return
        }

        photo.flipX = !photo.flipX
        photo.canvas.renderAll();
    }
    const flipY = (photo) => {
        if (!photo.canvas) {
            return
        }

        photo.flipY = !photo.flipY
        photo.canvas.renderAll();
    }
    useEffect(() => {
        if (canvas && object) {
            canvas.clear();

            if (photo) {
                photo.rotate(object.angle || 0)
                canvas.add(photo);
                canvas.renderAll();
            }
        }
    }, [canvas, object, photo]);

    const load = (url) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function () {
                const image = new fabric.Image(imgObj);
                const properties = image.set({
                    originX: "center",
                    originY: "center",
                    left: canvasSize / 2,
                    top: canvasSize / 2,
                });
                properties.scaleToWidth(canvasSize, false);
                properties.set('selectable', true);
                preparePhoto(properties);
                setPhoto(properties);
            }
        };
        reader.readAsDataURL(url);
    };

    return (
        <React.Fragment>
            <Modal
                open={open}
                closable={true}
                onCancel={close}
                destroyOnClose={true}
                width={"400px"}
                forceRender={true}
                footer={[
                    <Button key="1" style={{ flex: "1 1 auto" }} onClick={close}>Отмена</Button>,
                    <Button key="2"
                        color='primary'
                        style={{ flex: "1 1 auto" }}
                        onClick={e => {
                            triggerChange();
                            close();
                        }}>Готово</Button>
                ]}
                keyboard={false}
                afterClose={() => {
                    if (canvas && canvas.dispose) {
                        canvas.dispose();
                    }
                    setPhoto(undefined)
                    setCanvas(undefined)
                }}
            >
                <div style={{ width: "100%", height: "100%", resize: "none" }}>
                    <div style={{ paddingBottom: "25px", backgroundColor: "white" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{alignSelf: "center"}}>
                                <canvas id="canvas" style={{
                                    border: "1px solid #d9d9d9",
                                    borderRadius: "6px"
                                }} />
                            </div>
                            <div style={{ padding: "10px 0px", display: "flex" }}>

                                <div style={{ flex: "0 0 99px", paddingRight: "15px" }}>
                                    <Field
                                        key={"photo"}
                                        auth={auth}
                                        item={{
                                            label: "Фото",
                                            name: "file",
                                            type: "file",
                                            showUploadList: false,
                                            accept: ".png,.jpg",
                                            nocontent: true,
                                            trigger: () => (<div
                                                style={{
                                                    // width: 65,
                                                    // height: 65,
                                                    // borderRadius: "4px",
                                                    // backgroundColor: '#f5f5f5',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    color: '#999999',
                                                }}
                                            >
                                                <UserAddOutline style={{ fontSize: 32 }} />
                                            </div>)
                                        }}
                                        onChange={files => {
                                            if (files && files.length) {
                                                load(files[0]);
                                            }
                                        }}
                                    />
                                </div>
                                <div style={{ flex: "1 1 auto" }}>
                                    <div style={{ paddingBottom: "15px", display: "flex", gap: "5px" }}>
                                        <Button size="small" onClick={() => zoomIn(photo)}><Icofont icon="ui-zoom-in" /></Button>
                                        <Button size="small" onClick={() => zoomOut(photo)}><Icofont icon="ui-zoom-out" /></Button>
                                        <Button size="small" onClick={() => flipX(photo)}><SwapOutlined /></Button>
                                        <Button size="small" onClick={() => flipY(photo)}><SwapOutlined className="icofont-rotate-90" /></Button>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                        <div style={{ width: "100%", padding: "5px 10px", backgroundColor: "rgb(250 250 250)", borderRadius: "4px" }}>
                                            <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                                                <div style={{ flex: "0" }}>
                                                    <Button type="text" size='small' style={{ padding: "0px" }} onClick={v => setObject(o => ({ ...o, angle: 0 }))}>
                                                        <Icofont icon="rotation" />
                                                    </Button>
                                                </div>
                                                <div style={{ flex: "1" }}>
                                                    <Field
                                                        key={"angle"}
                                                        auth={auth}
                                                        item={{
                                                            label: 'Поворот',
                                                            name: "angle",
                                                            type: "int",
                                                            filterType: "slider",
                                                            realtime: true,
                                                            min: -180,
                                                            max: 180
                                                        }}
                                                        value={object.angle}
                                                        onChange={v => setObject(o => ({ ...o, angle: v }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    );
}
