// Copyright (c) 2021 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component, useCallback} from 'react';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import styled from 'styled-components';
import {FormattedMessage} from 'localization';
import classnames from 'classnames';

import ReactMarkdown from 'react-markdown';

import {IconRoundSmall, MapControlButton, Tooltip} from 'components/common/styled-components';
import MapLayerSelector from 'components/common/map-layer-selector';
//import KeplerGlLogo from 'components/common/logo';
import MapLegend from './map-legend';
import {
  Close,
  Cube3d,
  CursorClick,
  Delete,
  DrawPolygon,
  EyeSeen,
  EyeUnseen,
  Files,
  Info,
  Layers,
  Legend,
  Polygon,
  Rectangle,
  Split,
  Fullscreen
} from 'components/common/icons';
import VerticalToolbar from 'components/common/vertical-toolbar';
import ToolbarItem from 'components/common/toolbar-item';
import {EDITOR_MODES} from 'constants/default-settings';
import {LOCALE_CODES} from 'localization/locales';

const StyledMapControl = styled.div`
  right: 0;
  padding: ${props => props.theme.mapControl.padding}px;
  z-index: 10;
  margin-top: ${props => props.top || 0}px;
  position: absolute;
`;

const StyledMapControlAction = styled.div`
  padding: 4px 0;
  display: flex;
  justify-content: flex-end;
`;

const StyledMapControlPanel = styled.div`
  background-color: ${props => props.theme.mapPanelBackgroundColor};
  flex-grow: 1;
  z-index: 1;
  p {
    margin-bottom: 0;
  }
`;

const StyledMapControlPanelContent = styled.div.attrs({
  className: 'map-control__panel-content'
})`
  ${props => props.theme.dropdownScrollBar};
  max-height: 500px;
  min-height: 100px;
  min-width: ${props => props.theme.mapControl.width}px;
  overflow: auto;
`;

const StyledMapControlPanelHeader = styled.div.attrs({
  className: 'map-control__panel-header'
})`
  display: flex;
  justify-content: space-between;
  background-color: ${props => props.theme.mapPanelHeaderBackgroundColor};
  height: auto;
  padding: 6px 12px;
  font-size: 11px;
  color: ${props => props.theme.titleTextColor};
  position: relative;

  button {
    width: 18px;
    height: 18px;
  }
`;

const ActionPanel = ({className = '', children}) => (
  <StyledMapControlAction className={className}>{children}</StyledMapControlAction>
);

ActionPanel.displayName = 'ActionPanel';

/** @type {import('./map-control').MapControlTooltipComponent} */
const MapControlTooltip = React.memo(({id, message}) => (
  <Tooltip id={id} place="left" effect="solid">
    <span>
      <FormattedMessage id={message} />
    </span>
  </Tooltip>
));

MapControlTooltip.displayName = 'MapControlTooltip';

const MapLegendTooltip = ({id, message}) => (
  <Tooltip id={id} place="left" effect="solid">
    <span>
      <FormattedMessage id={message} />
    </span>
  </Tooltip>
);

/** @type {import('./map-control').LayerSelectorPanelComponent} */
const LayerSelectorPanel = React.memo(({items, onMapToggleLayer, isActive, toggleMenuPanel}) =>
  !isActive ? (
    (<MapControlButton
      key={'layerSelector'}
      onClick={e => {
        e.preventDefault();
        toggleMenuPanel();
      }}
      className="map-control-button toggle-layer"
      data-tip
      data-for="toggle-layer"
    >
      <Layers height="22px" />
      <MapControlTooltip
        id="toggle-layer"
        message={isActive ? 'tooltip.hideLayerPanel' : 'tooltip.showLayerPanel'}
      />
    </MapControlButton>)
  ) : (
    (<MapControlPanel header="header.visibleLayers" onClick={toggleMenuPanel}>
      <MapLayerSelector layers={items} onMapToggleLayer={onMapToggleLayer} />
    </MapControlPanel>)
  )
);

LayerSelectorPanel.displayName = 'LayerSelectorPanel';

/** @type {import('./map-control').MapControlPanelComponent} */
const MapControlPanel = React.memo(
  ({children, header, onClick, scale = 1, isExport, disableClose = false, logoComponent}) => (
    <StyledMapControlPanel
      style={{
        transform: `scale(${scale})`,
        marginBottom: '8px'
      }}
    >
      <StyledMapControlPanelHeader>
        {isExport && logoComponent ? (
          logoComponent
        ) : header ? (
          <span style={{verticalAlign: 'middle'}}>
            <FormattedMessage id={header} />
          </span>
        ) : null}
        {isExport ? null : (
          <IconRoundSmall className="close-map-control-item" onClick={onClick}>
            <Close height="16px" />
          </IconRoundSmall>
        )}
      </StyledMapControlPanelHeader>
      <StyledMapControlPanelContent>{children}</StyledMapControlPanelContent>
    </StyledMapControlPanel>
  )
);

MapControlPanel.displayName = 'MapControlPanel';

MapLegendPanelFactory.deps = [];
export function MapLegendPanelFactory() {
  const defaultActionIcons = {
    legend: Legend
  };
  /** @type {import('./map-control').MapLegendPanelComponent} */
  const MapLegendPanel = ({
    layers,
    isActive,
    scale,
    onToggleMenuPanel,
    isExport,
    disableClose,
    logoComponent,
    actionIcons = defaultActionIcons
  }) =>
    !isActive ? (
      (<MapControlButton
        key={'mapLegend'}
        data-tip
        data-for="show-legend"
        className="map-control-button show-legend"
        onClick={e => {
          e.preventDefault();
          onToggleMenuPanel();
        }}
      >
        <actionIcons.legend height="22px" />
        <MapLegendTooltip id="show-legend" message={'tooltip.showLegend'} />
      </MapControlButton>)
    ) : (
      (<MapControlPanel
        scale={scale}
        header={'header.layerLegend'}
        onClick={onToggleMenuPanel}
        isExport={isExport}
        disableClose={disableClose}
        logoComponent={logoComponent}
      >
        <MapLegend layers={layers} />
      </MapControlPanel>)
    );

  MapLegendPanel.displayName = 'MapControlPanel';
  return MapLegendPanel;
}

const StyledProjectPanel = styled.div`
  padding: 10px 20px;
  max-width: 220px;
  box-shadow: ${props => props.theme.panelBoxShadow};
  .project-title {
    color: ${props => props.theme.titleTextColor};
    font-size: 13px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
  }
  .project-description {
    color: ${props => props.theme.textColor};
    font-size: 11px;
    margin-top: 12px;
    a {
      font-weight: 500;
      color: ${props => props.theme.titleTextColor};
    }
  }
  .project-links {
    margin-top: 10px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    p {
      margin-top: 0;
    }
  }
`;
const StyledPanelAction = styled.div`
  border-radius: 2px;
  padding: 5px;
  font-weight: 500;
  a {
    align-items: center;
    justify-content: flex-start;
    display: flex;
    height: 16px;
    color: ${props => (props.active ? props.theme.textColorHl : props.theme.subtextColor)};
  }
  :hover {
    cursor: pointer;
    a {
      color: ${props => props.theme.textColorHl};
    }
  }
`;

const LinkButton = props => (
  <StyledPanelAction className="project-link__action">
    <a target="_blank" rel="noopener noreferrer" href={props.href}>
      <p>{props.label}</p>
    </a>
  </StyledPanelAction>
);
const LinkRenderer = props => {
  return (
    <a href={props.href} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
};

InfoButtonFactory.deps = [];
export function InfoButtonFactory() {
  const defaultActionIcons = {
    info: Info
  };

  const InfoButton = ({
    scale,
    isActive,
    isExport,
    onToggleMenuPanel,
    disableClose,
    logoComponent,
    info,
    actionIcons = defaultActionIcons
  }) =>
    !isActive ? (
      (<MapControlButton
        key={'mapInfo'}
        data-tip
        data-for="show-info"
        className="map-control-button show-info"
        onClick={e => {
          e.preventDefault();
          onToggleMenuPanel();
        }}
      >
        <actionIcons.info height="18px" />
        <Tooltip id="show-info" place="left" effect="solid">
          <span>
            <FormattedMessage id={'tooltip.showInfo'} />
          </span>
        </Tooltip>
      </MapControlButton>)
    ) : (
      (<MapControlPanel
        scale={scale}
        header={'\ '}
        onClick={onToggleMenuPanel}
        isExport={isExport}
        disableClose={disableClose}
        logoComponent={logoComponent}
      >
        <StyledProjectPanel>
          <div className="project-title">
            <div>{info.title}</div>
          </div>
          <div className="project-description">
            <ReactMarkdown
              source={info.detail || info.description}
              renderers={{link: LinkRenderer}}
            />
          </div>
          {info.dataUrl ? (
            <div className="project-links">
              <LinkButton
                label="Datasource"
                href={info.dataUrl}
                iconComponent={Files}
                height="15px"
              />
            </div>
          ) : null}
        </StyledProjectPanel>
      </MapControlPanel>)
    );

  InfoButton.displayName = 'InfoButton';
  return InfoButton;
}

FullscreenButtonFactory.deps = [];
export function FullscreenButtonFactory() {
  let isFullscreen = false;

  const FullscreenButton = ({
    isActive,
    isExport
  }) =>
    !isExport ? (
      (<MapControlButton
        key={'mapFullscreen'}
        data-tip
        data-for="action-fullscreen"
        className="map-control-button fullscreen-map"
        onClick={e => {
          e.preventDefault();
          let elem = document.documentElement;

          if(isFullscreen) {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
              document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
              document.msExitFullscreen();
            }
          }else{
            if (elem.requestFullscreen) {
              elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
              elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
              elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
              elem.msRequestFullscreen();
            }
          }

          isFullscreen = !isFullscreen;
        }}
      >
        <Fullscreen height="18px" />
        <MapControlTooltip
          id="action-fullscreen"
          message={'tooltip.fullscreen'}
        />
      </MapControlButton>)
    ) : null;

  FullscreenButton.displayName = 'FullscreenButton';
  return FullscreenButton;
}

SplitMapButtonFactory.deps = [];
export function SplitMapButtonFactory() {
  const defaultActionIcons = {
    delete: Delete,
    split: Split
  };
  /** @type {import('./map-control').SplitMapButtonComponent} */
  const SplitMapButton = React.memo(
    ({isSplit, mapIndex, onToggleSplitMap, actionIcons = defaultActionIcons}) => (
      <MapControlButton
        active={isSplit}
        onClick={e => {
          e.preventDefault();
          onToggleSplitMap(isSplit ? mapIndex : undefined);
        }}
        key={`split-${isSplit}`}
        className={classnames('map-control-button', 'split-map', {'close-map': isSplit})}
        data-tip
        data-for="action-toggle"
      >
        {isSplit ? <actionIcons.delete height="18px" /> : <actionIcons.split height="18px" />}
        <MapControlTooltip
          id="action-toggle"
          message={isSplit ? 'tooltip.closePanel' : 'tooltip.switchToDualView'}
        />
      </MapControlButton>
    )
  );

  SplitMapButton.displayName = 'SplitMapButton';
  return SplitMapButton;
}

Toggle3dButtonFactory.deps = [];
export function Toggle3dButtonFactory() {
  const defaultActionIcons = {
    cube: Cube3d
  };
  /** @type {import('./map-control').Toggle3dButtonComponent} */
  const Toggle3dButton = React.memo(
    ({dragRotate, onTogglePerspective, actionIcons = defaultActionIcons}) => (
      <MapControlButton
        onClick={e => {
          e.preventDefault();
          onTogglePerspective();
        }}
        active={dragRotate}
        data-tip
        data-for="action-3d"
      >
        <actionIcons.cube height="22px" />
        <MapControlTooltip
          id="action-3d"
          message={dragRotate ? 'tooltip.disable3DMap' : 'tooltip.3DMap'}
        />
      </MapControlButton>
    )
  );

  Toggle3dButton.displayName = 'Toggle3dButton';
  return Toggle3dButton;
}
const StyledToolbar = styled(VerticalToolbar)`
  position: absolute;
  right: 32px;
`;

MapDrawPanelFactory.deps = [];
export function MapDrawPanelFactory() {
  const defaultActionIcons = {
    visible: EyeSeen,
    hidden: EyeUnseen,
    polygon: DrawPolygon,
    cursor: CursorClick,
    innerPolygon: Polygon,
    rectangle: Rectangle
  };
  /** @type {import('./map-control').MapDrawPanelComponent} */
  const MapDrawPanel = React.memo(
    ({
      editor,
      isActive,
      onToggleMenuPanel,
      onSetEditorMode,
      onToggleEditorVisibility,
      actionIcons = defaultActionIcons
    }) => {
      return (
        <div className="map-draw-controls" style={{position: 'relative'}}>
          {isActive ? (
            <StyledToolbar show={isActive}>
              <ToolbarItem
                className="edit-feature"
                onClick={() => onSetEditorMode(EDITOR_MODES.EDIT)}
                label="toolbar.select"
                icon={actionIcons.cursor}
                active={editor.mode === EDITOR_MODES.EDIT}
              />
              <ToolbarItem
                className="draw-feature"
                onClick={() => onSetEditorMode(EDITOR_MODES.DRAW_POLYGON)}
                label="toolbar.polygon"
                icon={actionIcons.innerPolygon}
                active={editor.mode === EDITOR_MODES.DRAW_POLYGON}
              />
              <ToolbarItem
                className="draw-rectangle"
                onClick={() => onSetEditorMode(EDITOR_MODES.DRAW_RECTANGLE)}
                label="toolbar.rectangle"
                icon={actionIcons.rectangle}
                active={editor.mode === EDITOR_MODES.DRAW_RECTANGLE}
              />
              <ToolbarItem
                className="toggle-features"
                onClick={onToggleEditorVisibility}
                label={editor.visible ? 'toolbar.hide' : 'toolbar.show'}
                icon={editor.visible ? actionIcons.visible : actionIcons.hidden}
              />
            </StyledToolbar>
          ) : null}
          <MapControlButton
            onClick={e => {
              e.preventDefault();
              onToggleMenuPanel();
            }}
            active={isActive}
            data-tip
            data-for="map-draw"
          >
            <actionIcons.polygon height="22px" />
            <MapControlTooltip id="map-draw" message="tooltip.DrawOnMap" />
          </MapControlButton>
        </div>
      );
    }
  );

  MapDrawPanel.displayName = 'MapDrawPanel';
  return MapDrawPanel;
}

/** @type {import('./map-control').LocalePanelComponent} */
const LocalePanel = React.memo(
  ({availableLocales, isActive, onToggleMenuPanel, onSetLocale, activeLocale}) => {
    const onClickItem = useCallback(
      locale => {
        onSetLocale(locale);
      },
      [onSetLocale]
    );

    const onClickButton = useCallback(
      e => {
        e.preventDefault();
        onToggleMenuPanel();
      },
      [onToggleMenuPanel]
    );
    const getLabel = useCallback(locale => `toolbar.${locale}`, []);

    return (
      <div style={{position: 'relative'}}>
        {isActive ? (
          <StyledToolbar show={isActive}>
            {availableLocales.map(locale => (
              <ToolbarItem
                key={locale}
                onClick={() => onClickItem(locale)}
                label={getLabel(locale)}
                active={activeLocale === locale}
              />
            ))}
          </StyledToolbar>
        ) : null}
        <MapControlButton onClick={onClickButton} active={isActive} data-tip data-for="locale">
          {activeLocale.toUpperCase()}
          <MapControlTooltip id="locale" message="tooltip.selectLocale" />
        </MapControlButton>
      </div>
    );
  }
);

LocalePanel.displayName = 'LocalePanel';

const LegendLogo = null; //<KeplerGlLogo version={false} appName="kepler.gl" />;
MapControlFactory.deps = [
  MapDrawPanelFactory,
  Toggle3dButtonFactory,
  FullscreenButtonFactory,
  InfoButtonFactory,
  SplitMapButtonFactory,
  MapLegendPanelFactory
];
function MapControlFactory(MapDrawPanel, Toggle3dButton, FullscreenButton, InfoButton, SplitMapButton, MapLegendPanel) {
  class MapControl extends Component {
    static propTypes = {
      datasets: PropTypes.object.isRequired,
      dragRotate: PropTypes.bool.isRequired,
      isSplit: PropTypes.bool.isRequired,
      layers: PropTypes.arrayOf(PropTypes.object),
      layersToRender: PropTypes.object.isRequired,
      mapIndex: PropTypes.number.isRequired,
      mapControls: PropTypes.object.isRequired,
      onTogglePerspective: PropTypes.func.isRequired,
      onToggleSplitMap: PropTypes.func.isRequired,
      onToggleMapControl: PropTypes.func.isRequired,
      onSetEditorMode: PropTypes.func.isRequired,
      onToggleEditorVisibility: PropTypes.func.isRequired,
      top: PropTypes.number.isRequired,
      onSetLocale: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logoComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),

      // optional
      readOnly: PropTypes.bool,
      scale: PropTypes.number,
      mapLayers: PropTypes.object,
      editor: PropTypes.object
    };

    static defaultProps = {
      isSplit: false,
      top: 0,
      mapIndex: 0,
      logoComponent: LegendLogo
    };

    layerSelector = props => props.layers;
    layersToRenderSelector = props => props.layersToRender;
    layerPanelItemsSelector = createSelector(
      this.layerSelector,
      this.layersToRenderSelector,
      (layers, layersToRender) =>
        layers
          .filter(l => l.config.isVisible)
          .map(layer => ({
            id: layer.id,
            name: layer.config.label,
            // layer
            isVisible: layersToRender[layer.id]
          }))
    );

    render() {
      const {
        dragRotate,
        layers,
        layersToRender,
        isSplit,
        isExport,
        mapIndex,
        mapControls,
        onTogglePerspective,
        onToggleSplitMap,
        onMapToggleLayer,
        onToggleMapControl,
        editor,
        scale,
        readOnly,
        locale,
        top,
        logoComponent
      } = this.props;

      const {
        mapInfo = {},
        visibleLayers = {},
        mapLegend = {},
        toggle3d = {},
        splitMap = {},
        mapDraw = {},
        mapLocale = {}
      } = mapControls;

      return (
        <StyledMapControl className="map-control" top={top}>
          {/* Info-box Map */}
          {isExport !== true ? (
            <ActionPanel className="info-map" key={0}>
              <InfoButton
                scale={scale}
                isActive={mapInfo.active}
                isExport={isExport}
                onToggleMenuPanel={() => onToggleMapControl('mapInfo')}
                disableClose={mapInfo.disableClose}
                info={mapInfo.info}
              />
            </ActionPanel>
          ) : null}

          {/* Map Legend */}
          {mapLegend.show ? (
            <ActionPanel className="show-legend" key={1}>
              <MapLegendPanel
                layers={layers.filter(l => layersToRender[l.id])}
                scale={scale}
                isExport={isExport}
                onMapToggleLayer={onMapToggleLayer}
                isActive={mapLegend.active}
                onToggleMenuPanel={() => onToggleMapControl('mapLegend')}
                disableClose={mapLegend.disableClose}
                logoComponent={logoComponent}
              />
            </ActionPanel>
          ) : null}

          {/* Split Map */}
          {splitMap.show && readOnly !== true ? (
            <ActionPanel className="split-map" key={2}>
              <SplitMapButton
                isSplit={isSplit}
                mapIndex={mapIndex}
                onToggleSplitMap={onToggleSplitMap}
              />
            </ActionPanel>
          ) : null}

          {/* Map Layers */}
          {isSplit && visibleLayers.show && readOnly !== true ? (
            <ActionPanel className="map-layers" key={3}>
              <LayerSelectorPanel
                items={this.layerPanelItemsSelector(this.props)}
                onMapToggleLayer={onMapToggleLayer}
                isActive={visibleLayers.active}
                toggleMenuPanel={() => onToggleMapControl('visibleLayers')}
              />
            </ActionPanel>
          ) : null}

          {/* 3D Map */}
          {toggle3d.show ? (
            <ActionPanel className="toggle-3d" key={4}>
              <Toggle3dButton dragRotate={dragRotate} onTogglePerspective={onTogglePerspective} />
            </ActionPanel>
          ) : null}

          {mapDraw.show ? (
            <ActionPanel key={5}>
              <MapDrawPanel
                isActive={mapDraw.active && mapDraw.activeMapIndex === mapIndex}
                editor={editor}
                onToggleMenuPanel={() => onToggleMapControl('mapDraw')}
                onSetEditorMode={this.props.onSetEditorMode}
                onToggleEditorVisibility={this.props.onToggleEditorVisibility}
              />
            </ActionPanel>
          ) : null}

          {mapLocale.show ? (
            <ActionPanel key={6}>
              <LocalePanel
                isActive={mapLocale.active}
                activeLocale={locale}
                availableLocales={Object.keys(LOCALE_CODES)}
                onSetLocale={this.props.onSetLocale}
                onToggleMenuPanel={() => onToggleMapControl('mapLocale')}
                disableClose={mapLocale.disableClose}
              />
            </ActionPanel>
          ) : null}

          {/* Fullscreen Map */}
          {isExport !== true ? (
            <ActionPanel className="fullscreen-map" key={7}>
              <FullscreenButton />
            </ActionPanel>
          ) : null}
        </StyledMapControl>
      );
    }
  }

  MapControl.displayName = 'MapControl';

  return MapControl;
}

export default MapControlFactory;
