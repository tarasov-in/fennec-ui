import React, { useCallback, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { errorCatch, FieldMobile, GET, JSX, useAuth, useUserContext, ycStorage, pushStateHistoryModal, useNavigation } from 'fennec-ui';

import { SwapOutlined } from '@ant-design/icons';

import { Button, Popup } from 'antd-mobile';
import { PictureOutline, UserAddOutline } from 'antd-mobile-icons'

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

    //Поворот и масштабирование пальцами на телефоне
    const touchScaleRotateOn = (canvas) => {
        let touchstart = false
        let startLen = undefined
        let startAngle = undefined
        let startActiveObjectScale = undefined
        let startActiveObjectAngle = undefined
        let startQuarter = undefined
        let touchend = false
        let touch0Idx = 0
        let touch1Idx = 1
        canvas.upperCanvasEl.addEventListener("touchstart", (e) => {
            if (e?.touches?.length == 2 && canvas?.getActiveObject()) {
                touchstart = true
                touchend = false

                startActiveObjectScale = canvas.getActiveObject().scaleX
                startActiveObjectAngle = canvas.getActiveObject().angle

                touch0Idx = 0
                touch1Idx = 1
                if (e.touches[1].pageX < e.touches[0].pageX) {
                    touch0Idx = 1
                    touch1Idx = 0
                }

                startLen = Math.sqrt(Math.pow(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX, 2) + Math.pow(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY, 2))
                let angle = Math.atan(Math.abs(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY) / Math.abs(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX)) * 180 / Math.PI;

                //Определяем началную четверь, она может быть 0 или 3 (удобнее именно 3 а не 1, хотя можно и 1)
                //Так как на старте в touch0Idx.pageX всегда <= touch1Idx.pageX, то по оси X проверку не делаем
                if (e.touches[touch0Idx].pageY >= e.touches[touch1Idx].pageY) {
                    startQuarter = 0
                } else {
                    angle = Math.abs(angle - 90)
                    startQuarter = 3
                }
                startAngle = angle + 90 * startQuarter
                // console.log("touchstart", e, startLen, angle, startQuarter, startAngle) 
            }
        }, false);
        canvas.upperCanvasEl.addEventListener("touchend", (e) => {
            if (touchstart && e?.touches?.length != 2) {
                touchstart = false
                touchend = true
            }
        }, false);
        // canvas.upperCanvasEl.addEventListener("touchcancel", (e) => { console.log(e) }, false);
        let lastAngle = 0;
        canvas.upperCanvasEl.addEventListener("touchmove", (e) => {
            if (e?.touches?.length == 2 && canvas?.getActiveObject()) {

                let l = Math.sqrt(Math.pow(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX, 2) + Math.pow(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY, 2))
                let angle = Math.atan(Math.abs(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY) / Math.abs(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX)) * 180 / Math.PI;

                //Масштаб
                if (startLen) {
                    let x = (startActiveObjectScale * l) / startLen
                    // console.log(startActiveObjectScale, startLen, l, l-startLen, x)
                    canvas.getActiveObject().scale(x)
                    canvas.renderAll()
                }

                //Поворот
                if (Math.trunc(angle) != lastAngle) {
                    lastAngle = Math.trunc(angle);

                    if (lastAngle % 1 == 0) {

                        //Нумеруем четверти против часовой стрелки начиная с 0. Нулевая четверть левая верхняя.
                        //Для четвертей 1 и 3 арктангенс возвращает угол начиная с 90 а не с 0, меняем это на от 0 до 90 (lastAngle = Math.abs(lastAngle - 90))
                        let quarter = 0
                        if (e.touches[touch0Idx].pageX <= e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY >= e.touches[touch1Idx].pageY) {
                            quarter = 0
                        } else if (e.touches[touch0Idx].pageX > e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY >= e.touches[touch1Idx].pageY) {
                            lastAngle = Math.abs(lastAngle - 90)
                            quarter = 1
                        } else if (e.touches[touch0Idx].pageX > e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY < e.touches[touch1Idx].pageY) {
                            quarter = 2
                        } else if (e.touches[touch0Idx].pageX <= e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY < e.touches[touch1Idx].pageY) {
                            lastAngle = Math.abs(lastAngle - 90)
                            quarter = 3
                        }

                        //Текущий угол с учетом четвтерти
                        var currentAngle = lastAngle + 90 * quarter
                        //Рассчитанный угол на который нужно повернуть объект
                        var calcAngleRotate = currentAngle - startAngle

                        // console.log("touchmove", l, lastAngle, currentAngle, startAngle, calcAngleRotate) 

                        canvas.getActiveObject().angle = startActiveObjectAngle - calcAngleRotate
                        canvas.renderAll()
                    }
                }
            }
        }, false);
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
            enableRetinaScaling: false,
            height: canvasSize,
            width: canvasSize,
            backgroundColor: 'white',
            alignSelf: "center",
        });

        touchScaleRotateOn(canvas);

        const csize = "calc(100vw - 80px)";
        // const csize = "400px";
        // const csize = "300px";
        canvas.lowerCanvasEl.style.width = csize;
        canvas.lowerCanvasEl.style.height = csize;
        canvas.upperCanvasEl.style.width = csize;
        canvas.upperCanvasEl.style.height = csize;
        canvas.wrapperEl.style.width = csize;
        canvas.wrapperEl.style.height = csize;

        canvas.allowTaint = true;

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
        if (canvas) {
            canvas.upperCanvasEl.addEventListener("touchend", (e) => {
                if (e?.touches?.length == 0) {
                    if (canvas.getActiveObject()) {
                        let angle = canvas.getActiveObject().angle % 360 || 0;
                        if (angle > 180) {
                            angle -= 360
                        } else if (angle < -180) {
                            angle += 360
                        }
                        setObject(o => ({ ...o, angle: angle }))
                    }
                }
            }, false);
        }
    }, [canvas])

    const toLeft = (photo) => {
        if (!photo.canvas) {
            return
        }

        photo.left -= 10;
        photo.canvas.renderAll();
    }
    const toRight = (photo) => {
        if (!photo.canvas) {
            return
        }

        photo.left += 10;
        photo.canvas.renderAll();
    }
    const toUp = (photo) => {
        if (!photo.canvas) {
            return
        }

        photo.top -= 10;
        photo.canvas.renderAll();
    }
    const toDown = (photo) => {
        if (!photo.canvas) {
            return
        }

        photo.top += 10;
        photo.canvas.renderAll();
    }
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
            <Popup
                visible={open}
                showCloseButton
                bodyStyle={{ height: "100%" }}
                onClose={close}
                onMaskClick={close}
                destroyOnClose
                afterShow={createCanvas}
                afterClose={() => {
                    if (canvas && canvas.dispose) {
                        canvas.dispose();
                    }
                    setPhoto(undefined)
                    setCanvas(undefined)
                }}
            >
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: "0", padding: "0 10px" }}>
                        <div style={{ display: "flex", justifyContent: "center", padding: "10px 30px 10px 15px", fontSize: "16px" }}>
                            Редактор изображения
                        </div> 
                    </div>
                    <div style={{ overflowY: 'scroll', flex: "1", height: "100%" }}>
                        <div style={{ paddingBottom: "25px", backgroundColor: "white" }}>
                            <div style={{ display: "flex", flexDirection: "column", paddingTop: "10px" }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}>
                                    <canvas id="canvas" style={{
                                        border: "1px solid #d9d9d9",
                                        borderRadius: "6px"
                                    }} />
                                </div>
                                <div style={{ padding: "0px 5px" }}>
                                    <div style={{ padding: "5px 0px", width: "100%", display: "flex", justifyContent: "space-between", gap: "10px" }}>
                                        <div style={{ flex: "0" }}>
                                            <FieldMobile
                                                key={"photo"}
                                                auth={auth}
                                                item={{
                                                    label: "Фото",
                                                    name: "file",
                                                    type: "file",
                                                    showUploadList: false,
                                                    accept: ".png,.jpg",
                                                    header: false,
                                                    trigger: () => (<div
                                                        style={{
                                                            width: 65,
                                                            height: 65,
                                                            borderRadius: "4px",
                                                            backgroundColor: '#f5f5f5',
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
                                        <div style={{ padding: "5px 0px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                            <Button size="small" onClick={() => zoomIn(photo)}><i className="fa fa-search-plus"></i></Button>
                                            <Button size="small" onClick={() => zoomOut(photo)}><i className="fa fa-search-minus"></i></Button>
                                            <Button size="small" onClick={() => flipX(photo)}><SwapOutlined /></Button>
                                            <Button size="small" onClick={() => flipY(photo)}><SwapOutlined className="icofont-rotate-90" /></Button>
                                            <Button size="small" onClick={() => toLeft(photo)}><i className="fa fa-long-arrow-left"></i></Button>
                                            <Button size="small" onClick={() => toRight(photo)}><i className="long-arrow-right" /></Button>
                                            <Button size="small" onClick={() => toUp(photo)}><i className="long-arrow-up" /></Button>
                                            <Button size="small" onClick={() => toDown(photo)}><i className="long-arrow-down" /></Button>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                        <div style={{ width: "100%", padding: "5px 10px", marginBottom: "5px", backgroundColor: "rgb(250 250 250)", borderRadius: "4px" }}>
                                            <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                                                <div style={{ flex: "0" }}>
                                                    <Button type="text" size='small' style={{ padding: "2px 5px" }} onClick={v => setObject(o => ({ ...o, angle: 0 }))}>
                                                    <i className="fa fa-repeat"></i>
                                                    </Button>
                                                </div>
                                                <div style={{ flex: "1" }}>
                                                    <FieldMobile
                                                        key={"angle"}
                                                        auth={auth}
                                                        item={{
                                                            label: 'Поворот',
                                                            name: "angle",
                                                            type: "int",
                                                            filterType: "slider",
                                                            realtime: true,
                                                            min: -180,
                                                            max: 180,
                                                            header: false,
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
                    <div style={{ flex: "0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px" }}>
                            <Button style={{ flex: "1 1 auto" }} onClick={close}>Отмена</Button>
                            <Button                              
                                color='primary' 
                                style={{ flex: "1 1 auto" }} 
                                onClick={e => {
                                    triggerChange();
                                    close();
                                }}>Готово</Button>
                        </div>
                    </div>
                </div>
            </Popup>
        </React.Fragment>
    );
}
