import L from "leaflet";

import '../legend/leaflet.wmslegend.css'
import '../legend/leaflet.wmslegend'
import 'leaflet-wfst/dist/leaflet-wfst.min'

L.Control.Appearance = L.Control.extend({
	options: {
		collapsed: false,
		position: 'topright',
		label: null,
		radioCheckbox: true,
		layerName: true,
		opacity: false,
		color: false,
		remove: false,
		removeIcon: null,
	},
	initialize: function (baseLayers, uneditableOverlays, overlays, options) {
		L.Util.setOptions(this, options);
		this._layerControlInputs = [];
		this._layers = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}
		for (var i in uneditableOverlays) {
			this._addLayer(uneditableOverlays[i], i, true, true);
		}

		for (var i in overlays) {
			this._addLayer(overlays[i], i, true);
		}

        //this._map.removeControl(this.options.legendPanel)

	},
	onAdd: function (map) {
		this._initLayout();
		this._update();
		return this._container;
	},
	// @method addOverlay(layer: Layer, name: String): this
	// Adds an overlay (checkbox entry) with the given name to the control.
	addOverlay: function (layer, unremovable) {
		this._addLayer(layer, layer.options.name, true, unremovable);
		return (this._map) ? this._update() : this;
	},
	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._update();
		}

		var obj = this._getLayer(L.stamp(e.target));

		// @namespace Map
		// @section Layer events
		// @event baselayerchange: LayersControlEvent
		// Fired when the base layer is changed through the [layer control](#control-layers).
		// @event overlayadd: LayersControlEvent
		// Fired when an overlay is selected through the [layer control](#control-layers).
		// @event overlayremove: LayersControlEvent
		// Fired when an overlay is deselected through the [layer control](#control-layers).
		// @namespace Control.Layers
		var type = obj.overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},
	expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
		this._form.style.height = null;
		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
		if (acceptableHeight < this._form.clientHeight) {
			L.DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar');
			this._form.style.height = acceptableHeight + 'px';
		} else {
			L.DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar');
		}
		return this;
	},
	collapse: function () {
		L.DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded');
		return this;
	},
	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className),
		    collapsed = this.options.collapsed;
		container.setAttribute('aria-haspopup', true);
		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);
		if(this.options.label){
			var labelP = L.DomUtil.create('p', className + "-label");
			labelP.innerHTML = this.options.label;
			container.appendChild(labelP);
		}
		var form = this._form = L.DomUtil.create('form', className + '-list');
		if (collapsed) {
			if (!L.Browser.android) {
				L.DomEvent.on(container, {
					mouseenter: this.expand,
					mouseleave: this.collapse
				}, this);
			}
		}
		if (!collapsed) {
			this.expand();
		}
		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
		container.appendChild(form);
	},
	_update: function () {
		if (!this._container) { return this; }
		L.DomUtil.empty(this._baseLayersList);
		L.DomUtil.empty(this._overlaysList);
		this._layerControlInputs = [];
		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;
		for (i = 0; i < this._layers.length; i++) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
			baseLayersCount += !obj.overlay ? 1 : 0;
		}
		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
		return this;
	},
	_getLayer: function (id) {
		for (var i = 0; i < this._layers.length; i++) {
			if (this._layers[i] && L.Util.stamp(this._layers[i].layer) === id) {
				return this._layers[i];
			}
		}
	},
	_addLayer: function (layer, name, overlay, uneditable) {
		this._layers.push({
			layer: layer,
			name: name,
			overlay: overlay,
			uneditable: uneditable
		});
	},
	_removeLayer: function (id) {
		for (var i = 0; i < this._layers.length; i++) {
			if (this._layers[i] && L.Util.stamp(this._layers[i].layer) === id) {
				this._layers.splice(i,1);
				break;
			}
		}
	},
	_addItem: function (obj) {
		var label = document.createElement('label'),
			checked = this._map.hasLayer(obj.layer),
			layerName = obj.name
        let opacity = obj.layer.options.opacity,
            color = obj.layer.options.color,
            elements = [];

		//HTML Elements for OVERLAY
		if (obj.overlay) {
			if (this.options.radioCheckbox){elements.push(this._createCheckboxElement('leaflet-control-layers-selector', checked))};
			if (this.options.layerName){elements.push(this._createNameElement('leaflet-control-layers-name', layerName))};
			if (this.options.opacity){elements.push(this._createRangeElement('leaflet-control-layers-range', opacity))};
			if (this.options.color && !obj.uneditable){elements.push(this._createColorElement('leaflet-control-layers-color', color))};
			if (this.options.remove && !obj.uneditable){elements.push(this._createRemoveElement('leaflet-control-layers-remove'))};
		}else{
			if (this.options.radioCheckbox){elements.push(this._createRadioElement('leaflet-control-layers-selector', checked))};
			if (this.options.layerName){elements.push(this._createNameElement('leaflet-control-layers-name', layerName))};
		}

        elements.push(this._createOrderUPElement('leaflet-control-layers-up',
            layerName,
            L.Util.stamp(obj.layer)))
        elements.push(this._createOrderDOWNElement('leaflet-control-layers-down',
            layerName,
            L.Util.stamp(obj.layer)))
        elements.push(this._createZoomElement('leaflet-control-layers-zoom',
            layerName,
            L.Util.stamp(obj.layer)))

        if(!obj.layer.options.type){
            /*elements.push(this._createWFSElement('leaflet-control-layers-wfs',
                layerName,
                L.Util.stamp(obj.layer)))*/
            if(obj.layer.options.legendUrl !== "nolegend"){
                elements.push(this._createLegendViewElement('leaflet-control-layers-legend',
                    layerName,
                    L.Util.stamp(obj.layer),obj.layer.options.index))
            }

        }

        /*if(obj.layer.options.type === "WFS"){
            elements.push(this._createWFSLoadElement('leaflet-control-layers-load',
                layerName,
                L.Util.stamp(obj.layer)))

        }*/


        elements.push(this._createCustomRemoveElement('leaflet-control-layers-delete',
            layerName,
            L.Util.stamp(obj.layer)))



		var holder = document.createElement('div');
		holder.style = "display: flex; align-items: baseline;";
		label.appendChild(holder);
		for (var i = 0; i < elements.length; i++) {
			holder.appendChild(elements[i]);
			if (i == 1){continue}; //layer name don't need UI
			this._layerControlInputs.push(elements[i]);
			elements[i].layerId = L.Util.stamp(obj.layer);
			switch(elements[i].className){
				case "leaflet-control-layers-range":
					L.DomEvent.on(elements[i], 'change', this._onRangeClick, this);
					break;
				case "leaflet-control-layers-selector":
					L.DomEvent.on(elements[i], 'change', this._onRadioCheckboxClick, this);
					break;
				case "leaflet-control-layers-color":
					L.DomEvent.on(elements[i], 'change', this._onColorClick, this);
					break;
				case "leaflet-control-layers-remove":
					L.DomEvent.on(elements[i], 'change', this._onRemoveClick, this);
					break;
                case "leaflet-control-layers-up":
                    L.DomEvent.on(elements[i], 'click', this._onUPClick, this);
                    break;
                case "leaflet-control-layers-down":
                    L.DomEvent.on(elements[i], 'click', this._onDOWNClick, this);
                    break;
                case "leaflet-control-layers-legend":
                    L.DomEvent.on(elements[i], 'click', this._onViewClick, this);
                    break;
                case "leaflet-control-layers-zoom":
                    L.DomEvent.on(elements[i], 'click', this._onZoomClick, this);
                    break;
                case "leaflet-control-layers-wfs":
                    L.DomEvent.on(elements[i], 'click', this._onWFSClick, this);
                    break;
                case "leaflet-control-layers-load":
                    L.DomEvent.on(elements[i], 'click', this._onWFSSyncClick, this);
                    break;
                case "leaflet-control-layers-delete":
                    L.DomEvent.on(elements[i], 'click', this._onCustomRemoveClick, this);
                    break;
			}
		};
		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);
		return label;
	},
	_createRadioElement: function (name, checked) {
		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
				name + '"' + (checked ? ' checked="checked"' : '') + '/>';
		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;
		return radioFragment.firstChild;
	},
	_createCheckboxElement: function (name, checked) {
		var input = document.createElement('input');
		input.type = 'checkbox';
		input.className = name;
		input.defaultChecked = checked;
		return input;
	},
	_createNameElement: function (name, layerName) {
		var nameLabel = document.createElement('span');
		nameLabel.style.display = "inline-block";
		nameLabel.style.width = "100px";
		nameLabel.style.margin = "0 5 0 5";
		nameLabel.style.overflow = "hidden";
		nameLabel.style.verticalAlign = "middle";
        nameLabel.title = layerName;

		nameLabel.innerHTML = ' ' + layerName;
		return nameLabel;
	},
	_createRangeElement: function (name, opacity) {
		var input = document.createElement('input');
		input.type = 'range';
		input.style.width = "50px";
		input.className = name;
		input.min = 0;
		input.max = 100;
		input.value = opacity * 100;
		return input;
	},
	_createColorElement: function (name, color) {
		var colorHtml = '<input type="color" class="leaflet-control-layers-color" value="' +
						color + '"' +
						'list="data1"/ style="width:50px; margin:0 5 0 5;">';
		var colorFragment = document.createElement('div');
		colorFragment.innerHTML = colorHtml;
		return colorFragment.firstChild;
	},
    _createOrderUPElement: function (name,layerName,layerId) {

        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: green;" +
            "border: 1px solid green;" +
            "padding: 0.1rem 0.4rem;" +
            "margin: 0.5rem;"+
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = layerId;
        button.title="Up"
        var upFragment = document.createElement('i');

        upFragment.layerName = layerName;
        upFragment.layerId = layerId;

        upFragment.className = "fad fa-arrow-up";
        button.insertBefore(upFragment, button.lastChild);
        return button;
    },
    _createOrderDOWNElement: function (name,layerName,layerId) {

        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: red;" +
            "border: 1px solid red;" +
            "padding: 0.1rem 0.4rem;" +
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = layerId;
        button.title="Down"
        var downFragment = document.createElement('i');

        downFragment.layerName = layerName;
        downFragment.layerId = layerId;

        downFragment.className = "fad fa-arrow-down";
        button.insertBefore(downFragment, button.lastChild);

        return button;

    },
    _createZoomElement: function (name,layerName,layerId) {

        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: blue;" +
            "border: 1px solid blue;" +
            "padding: 0.1rem 0.4rem;" +
            "margin: 0.5rem;"+
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = "z_"+layerId;
        button.id = "z_"+layerId;
        button.type = "button"
        button.title="Go to layer"
        var downFragment = document.createElement('i');

        downFragment.layerName = layerName;
        downFragment.layerId = layerId;

        downFragment.className = "fad fa-search-location";
        button.insertBefore(downFragment, button.lastChild);

        return button;

    },
    _createWFSElement: function (name,layerName,layerId) {

        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: blue;" +
            "border: 1px solid blue;" +
            "margin-right: 0.5rem;"+
            "padding: 0.1rem 0.4rem;" +
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = "w_"+layerId;
        button.id = "w_"+layerId;
        button.type = "button"
        button.title="Load WFS layer"
        var downFragment = document.createElement('i');

        downFragment.layerName = layerName;
        downFragment.layerId = layerId;

        downFragment.className = "fad fa-hexagon";
        button.insertBefore(downFragment, button.lastChild);

        return button;

    },
    _createWFSLoadElement: function (name,layerName,layerId) {

        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: blue;" +
            "border: 1px solid blue;" +
            "margin-right: 0.5rem;"+
            "padding: 0.1rem 0.4rem;" +
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = "f_"+layerId;
        button.id = "f_"+layerId;
        button.type = "button"
        button.title="Sync WFS layer"
        var downFragment = document.createElement('i');

        downFragment.layerName = layerName;
        downFragment.layerId = layerId;

        downFragment.className = "fad fa-sync";
        button.insertBefore(downFragment, button.lastChild);

        return button;

    },
    _createLegendViewElement: function (name,layerName,layerId,index) {
        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: blue;" +
            "border: 1px solid blue;" +
            "padding: 0.1rem 0.4rem;" +
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = layerId;
        button.id = layerId;
        button.type = "button"
        button.title="Show/Hide Legend"
        var downFragment = document.createElement('i');

        downFragment.layerName = layerName;
        downFragment.layerId = layerId;

        if(index === 0){
            downFragment.className = "fad fa-eye";
        }else{
            downFragment.className = "fad fa-eye-slash";
        }

        button.insertBefore(downFragment, button.lastChild);

        return button;

    },
    _createCustomRemoveElement: function (name,layerName,layerId,index) {
        var button = document.createElement('button');
        button.className = name;

        button.style.cssText="color: #ffffff;background: grey;" +
            "border: 1px solid greyr;" +
            "margin-left: 0.5rem;"+
            "padding: 0.1rem 0.4rem;" +
            "font-size: 1rem;" +
            "transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;" +
            "border-radius: 4px;"

        button.layerName = layerName;
        button.layerId = "c_"+layerId;
        button.id = "c_"+layerId;
        button.type = "button"
        button.title="Remove layer"
        var downFragment = document.createElement('i');

        downFragment.layerName = layerName;
        downFragment.layerId = layerId;

        downFragment.className = "fad fa-times";
        button.insertBefore(downFragment, button.lastChild);

        return button;

    },
	_createRemoveElement: function (name, imgUrl) {
		var input = document.createElement('input');
		input.type = 'checkbox';
		input.className = name;
		input.defaultChecked = true;
		imgUrl = this.options.removeIcon;
		if (imgUrl){
			input.style = "-webkit-appearance:none; background:url(" + imgUrl + "); width:1rem; height:1rem; background-size: contain;";
		}
		return input;
	},
	_onRadioCheckboxClick: function () {
		var inputs = this._layerControlInputs,
		    input, layer;
		var addedLayers = [],
		    removedLayers = [];

		this._handlingClick = true;
		for (var i = 0; i < inputs.length; i++) {
			input = inputs[i];
			if (input.className != "leaflet-control-layers-selector"){continue};
			layer = this._getLayer(input.layerId).layer;

			if (input.checked) {
				this._map.addLayer(layer);
				if(layer.options.index === 0){
                    this._map.removeControl(this.options.legendPanel)
                    this.options.legendPanel = L.wmsLegend(layer.options.legendUrl);
                    this._map.addControl(this.options.legendPanel);
                }
			} else if (!input.checked) {
				this._map.removeLayer(layer);
                if(layer.options.index ===0){
                    this._map.removeControl(this.options.legendPanel)
                }
			}
		}

		for (i = 0; i < removedLayers.length; i++) {
			if (this._map.hasLayer(removedLayers[i])) {
				this._map.removeLayer(removedLayers[i]);
			}
		}
		for (i = 0; i < addedLayers.length; i++) {
			if (!this._map.hasLayer(addedLayers[i])) {
				this._map.addLayer(addedLayers[i]);
			}
		}

		this._handlingClick = false;
		this._refocusOnMap();
	},
	_onRangeClick: function () {
		var inputs = this._layerControlInputs,
			input, layer;

		this._handlingClick = true;

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			if (input.className != "leaflet-control-layers-range"){continue};
			layer = this._getLayer(input.layerId).layer;
			//undefined = overlay, not undefined = tilemap
			if( typeof layer._url === 'undefined'){
				var rangeVal = parseFloat(parseInt(input.value / 10)/10);
				var style = {"opacity":rangeVal,
							"fillOpacity":(rangeVal / 2)};
				layer.setStyle(style);
				layer.options.opacity = rangeVal;
				layer.options.fillOpacity = rangeVal / 2;
			}else{
				layer.setOpacity(input.value / 100);
			}
		}
		this._handlingClick = false;
		this._refocusOnMap();
	},
	_onColorClick: function () {
		var inputs = this._layerControlInputs,
			input, layer;

		this._handlingClick = true;
		for (var i = 0; i < inputs.length; i++) {
			input = inputs[i];
			if (input.className != "leaflet-control-layers-color"){continue};
			layer = this._getLayer(input.layerId).layer;
			//not tilemap
			if( typeof layer._url === 'undefined'){
				var style = {"color":input.value,
							"opacity":layer.options.opacity,
							"fillOpacity":layer.options.fillOpacity};
				layer.setStyle(style);
				layer.options.color = input.value;
			};
		}
		this._handlingClick = false;
		this._update();
		this._refocusOnMap();
	},
	_onRemoveClick: function () {
		var inputs = this._layerControlInputs,
			input, layer;

		this._handlingClick = true;
		for (var i = 0; i < inputs.length; i++) {
			input = inputs[i];
			if (input.className != "leaflet-control-layers-remove"){continue};
			if (!input.checked){
				layer = this._getLayer(input.layerId).layer;
				this._map.removeLayer(layer);
				this._removeLayer(input.layerId);
				break;
			}
		}
		this._handlingClick = false;
		this._update();
		this._refocusOnMap();
	},

    _compare: function(a,b){
        if ( a.layer.options.index < b.layer.options.index ){
            return -1;
        }
        if ( a.layer.options.index > b.layer.options.index ){
            return 1;
        }
        return 0;
    },
    _onUPClick: function (event) {
        var layer = this._getLayer(event.target.layerId).layer;
        var found = false;
        this._layers.forEach(
            (item)=>{
                if(item.layer.options.index !== undefined){
                    if(item.layer.options.index === layer.options.index-1){
                        if(found === false){
                            var newIndex =  item.layer.options.index;
                            var oldIndex = layer.options.index
                            layer.options.index = newIndex;
                            item.layer.options.index = oldIndex;

                            this._map.getPane(layer.options.pane).style.zIndex = 300-newIndex;
                            this._map.getPane(item.layer.options.pane).style.zIndex = 300-oldIndex;

                            if((newIndex === 0)&&(layer.options.legendUrl !== "nolegend")){
                                this._map.removeControl(this.options.legendPanel)
                                this.options.legendPanel = L.wmsLegend(layer.options.legendUrl);
                                this._map.addControl(this.options.legendPanel);
                            }
                            found = true
                        }
                    }
                }
            }
        )

        this._layers.sort(this._compare);
        this._handlingClick = false;

        this._update();
        this._refocusOnMap();
    },
    _onDOWNClick: function (event) {
        var layer = this._getLayer(event.target.layerId).layer;
        var found = false;
        this._layers.forEach(
            (item)=>{
                if(item.layer.options.index !== undefined){
                    if(item.layer.options.index === layer.options.index+1){
                        if(found === false){

                            var newIndex =  item.layer.options.index;
                            var oldIndex = layer.options.index
                            layer.options.index = newIndex;
                            item.layer.options.index = oldIndex;

                            this._map.getPane(layer.options.pane).style.zIndex = 300-newIndex;
                            this._map.getPane(item.layer.options.pane).style.zIndex = 300-oldIndex;

                            if((oldIndex === 0)&&(layer.options.legendUrl !== "nolegend")){
                                this._map.removeControl(this.options.legendPanel)
                                this.options.legendPanel = L.wmsLegend(item.layer.options.legendUrl);
                                this._map.addControl(this.options.legendPanel);
                            }
                            found = true;
                        }

                    }
                }
            }
        )

        this._layers.sort(this._compare);
        this._handlingClick = false;

        this._update();
        this._refocusOnMap();
    },
    _onViewClick: function (event) {

        this._handlingClick = true;
	    var layer = this._getLayer(event.target.layerId).layer;
        if(this.options.legendPanel){
            this._map.removeControl(this.options.legendPanel)
        }

        this.options.legendPanel = L.wmsLegend(layer.options.legendUrl);
        this._map.addControl(this.options.legendPanel);

        var inputs = this._layerControlInputs;
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if(input.className === "leaflet-control-layers-legend"){
                if(event.target.layerId === parseInt(input.id)){
                    if(input.children[0].className === "fad fa-eye"){
                        input.children[0].className="fad fa-eye-slash"
                        if(this.options.legendPanel){
                            this._map.removeControl(this.options.legendPanel)
                        }
                    }else if(input.children[0].className === "fad fa-eye-slash"){
                        input.children[0].className="fad fa-eye"
                    }
                }else{
                    input.children[0].className="fad fa-eye-slash"
                }
            }
        }
        this._handlingClick = false;
        this._refocusOnMap();
    },
    _onZoomClick: function (event) {
        this._handlingClick = true;
        var layer = this._getLayer(event.target.layerId).layer;
        if(layer.latLng){
            var southWest  = L.latLng(parseFloat(layer.bbox.minx), parseFloat(layer.bbox.miny));
            var northEast   = L.latLng(parseFloat(layer.bbox.maxx), parseFloat(layer.bbox.maxy));
            var bounds = L.latLngBounds(southWest,northEast);
            this._map.fitBounds(bounds);
        }else if(layer.bbox){
            var southWest  = L.latLng(parseFloat(layer.bbox.minx), parseFloat(layer.bbox.miny));
            var northEast   = L.latLng(parseFloat(layer.bbox.maxx), parseFloat(layer.bbox.maxy));
            var bounds = L.latLngBounds(southWest,northEast);
            this._map.fitBounds(bounds);

        }else{
            this._map.fitBounds(layer.getBounds());
        }


        this._handlingClick = false;
        this._refocusOnMap();
    },
    _onWFSClick: function (event) {
        this._handlingClick = true;
        var layer = this._getLayer(event.target.layerId).layer;

        var filter = new L.Filter.GmlObjectID(1);

        const wfstPointOptions = {
            crs: L.CRS.EPSG4326,
            filter:filter.toGml(),
            showExisting: true,
            url: 'https://geonode.centralasiaclimateportal.org/geoserver/wfs',
            typeNS: 'geonode',
            typeName: layer.options.layers,
            maxFeatures: 80,
            opacity: 1,
            style: function(layer) {
                // you can use if statemt etc
                return {
                    color: 'black',
                    weight: 1
                }
            },
        };

        const wfstPoint = new L.WFST(
            wfstPointOptions,
            new L.Format.GeoJSON({
                crs: L.CRS.EPSG4326
            }));

        wfstPoint.options.name = layer.options.layers;
        wfstPoint.options.type = "WFS";
        wfstPoint.options.pane = layer.options.pane;

        this._map.downloadList = this.options.downloadList

        wfstPoint.addTo(this._map).on('load', function () {
            var geojson = wfstPoint.toGeoJSON();
            var geojsonLayer = L.geoJSON(geojson,{
                onEachFeature: function (feature,layer) {
                    if (feature.properties) {
                        layer.bindPopup(JSON.stringify(feature.properties));
                    }
                    layer.on(
                        {
                            'dblclick': function (e) {
                                this._map.downloadList.addLayer(e.sourceTarget);
                            }
                        }
                    )
                }
            })
            geojsonLayer.addTo(this._map)
            this._map.fitBounds(geojsonLayer.getBounds());

        });


        this.addOverlay(wfstPoint,false);
        this._handlingClick = false;
        this._refocusOnMap();
        //this._update();
    },
    _onWFSSyncClick: function (event) {
        this._handlingClick = true;
        var layer = this._getLayer(event.target.layerId).layer;

        var layerName = layer.options.name;


        var point_1 = 0;
        var point_2 = 0;

        this._map.eachLayer(
            (item)=>{
                if(item.pm){
                    if(item.pm._shape){
                        if(item.pm._shape === "BBox") {
                            point_1 = item._bounds._southWest;
                            point_2 = item._bounds._northEast;




                            var filter =
                                new L.Filter.BBox('the_geom',
                                    L.latLngBounds(point_1, point_2),
                                    L.CRS.EPSG4326);

                            const wfstPointOptions = {
                                crs: L.CRS.EPSG4326,
                                filter:filter.toGml(),
                                showExisting: true,
                                url: 'https://geonode.centralasiaclimateportal.org/geoserver/wfs',
                                typeNS: 'geonode',
                                typeName: layerName,
                                maxFeatures: 80,
                                opacity: 1,
                                style: function(layer) {
                                    // you can use if statemt etc
                                    return {
                                        color: 'black',
                                        weight: 5
                                    }
                                },
                            };

                            const wfstPoint = new L.WFST(
                                wfstPointOptions,
                                new L.Format.GeoJSON({
                                    crs: L.CRS.EPSG4326
                                }));

                            wfstPoint.options.name = layerName;
                            wfstPoint.options.type = "WFS";
                            wfstPoint.options.pane = layerName;

                            wfstPoint.addTo(this._map).on('load', function () {
                                var geojson = wfstPoint.toGeoJSON();
                                var geojsonLayer = L.geoJSON(geojson,{
                                    onEachFeature: function (feature,layer) {
                                        if (feature.properties) {
                                            layer.bindPopup(JSON.stringify(feature.properties));
                                        }
                                        layer.on(
                                            {
                                                'dblclick': function (e) {
                                                    this._map.downloadList.addLayer(e.sourceTarget);
                                                }
                                            }
                                        )
                                    }
                                })
                                geojsonLayer.addTo(this._map)
                                this._map.fitBounds(geojsonLayer.getBounds());

                            });

                            this.addOverlay(wfstPoint,false);

                            this._handlingClick = false;

                            this._map.removeLayer(layer);
                            this._removeLayer(event.target.layerId);
                            this._update();
                            this._refocusOnMap();
                        }
                    }
                }
            }
        )
    },
    _onCustomRemoveClick: function (event) {
        this._handlingClick = true;
        var layer = this._getLayer(event.target.layerId).layer;
        this._map.removeLayer(layer);
        this._removeLayer(event.target.layerId);

        /*if(this.options.legendPanel){
            this._map.removeControl(this.options.legendPanel)
        }*/

        this._handlingClick = false;
        this._update();
        this._refocusOnMap();

    }


});
L.control.appearance = function (baseLayers, uneditableOverlays, overlays, options) {
        return new L.Control.Appearance(baseLayers, uneditableOverlays, overlays, options);
};
