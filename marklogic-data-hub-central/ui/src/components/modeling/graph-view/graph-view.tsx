import React, { CSSProperties, useContext, useEffect, useState } from "react";
import { AutoComplete, Dropdown, Icon, Menu, Radio } from "antd";
import styles from "./graph-view.module.scss";
import { ModelingTooltips } from "../../../config/tooltips.config";
import { MLTooltip, MLInput, MLButton } from "@marklogic/design-system";
import { DownOutlined } from "@ant-design/icons";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import GraphViewSidePanel from "./side-panel/side-panel";
import { ModelingContext } from "../../../util/modeling-context";
import { defaultModelingView } from "../../../config/modeling.config";
import GraphVis from "./graph-vis/graph-vis";
import mockEntities from './mockEntities.json';

type Props = {
  entityTypes: any;
};

const GraphView: React.FC<Props> = (props) => {

  const [viewSidePanel, setViewSidePanel] = useState(false);
  const { modelingOptions, setSelectedEntity } = useContext(ModelingContext);
  const [nodePositions, setNodePositions] = useState({});
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [mode, setMode] = useState("Off");

  useEffect(() => {
    if (modelingOptions.view === defaultModelingView && modelingOptions.selectedEntity) {
      if (!viewSidePanel) {
        setViewSidePanel(true);
      }
    }
  }, [modelingOptions.selectedEntity]);

  const escFunction = (event) => {
    if (event.keyCode === 27) {
      if (mode === "Off") {
        setMode("AddEdge");
       } else {
        setMode("Off");
       }
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [mode]);

  const publishIconStyle: CSSProperties = {
    width: "20px",
    height: "20px",
    fill: "currentColor",
  };

  const filter = <AutoComplete
    className={styles.filterInput}
    dataSource={[]}
    aria-label="graph-view-filter-autoComplete"
    placeholder={"Filter"}
  >
    <MLInput aria-label="graph-view-filter-input" suffix={<Icon className={styles.searchIcon} type="search" theme="outlined" />} size="small"></MLInput>
  </AutoComplete>;

  const menu = (
    <Menu>
      <Menu.Item key="addNewEntityType">
        <span aria-label={"addNewEntityTypeOption"}>Add new entity type</span>
      </Menu.Item>
      <Menu.Item key="addNewRelationship">
        <span aria-label={"addNewRelationshipOption"}>Add new relationship</span>
      </Menu.Item>
    </Menu>
  );

  const headerButtons = <span className={styles.buttons}>
    <span>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        overlayClassName={styles.stepMenu}
        placement="bottomRight"
      >
        <div className={styles.addButtonContainer}>
          <MLButton aria-label="add-entity-type-relationship" size="default" type="primary">
            <span className={styles.addButtonText}>Add</span>
            <DownOutlined className={styles.downArrowIcon} />
          </MLButton>
        </div>
      </Dropdown>
    </span>
    <MLTooltip title={ModelingTooltips.publish}>
      <MLButton aria-label="publish-to-database" size="default" type="secondary">
        <span className={styles.publishButtonContainer}>
          <PublishToDatabaseIcon style={publishIconStyle} />
          <span className={styles.publishButtonText}>Publish</span>
        </span>
      </MLButton>
    </MLTooltip>
    <MLTooltip title={ModelingTooltips.exportGraph} placement="topLeft">
      <FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} size="2x" aria-label="graph-export" />
    </MLTooltip>
  </span>;

  const splitPaneStyles = {
    pane1: { minWidth: "150px" },
    pane2: { minWidth: "140px", maxWidth: "90%" },
    pane: { overflow: "hidden" },
  };

  const splitStyle: CSSProperties = {
    position: "relative",
    height: "none",
  };

  const handleEntitySelection = (entityName) => {
    setSelectedEntity(entityName);
  };

  const onCloseSidePanel = () => {
    setViewSidePanel(false);
    setSelectedEntity(undefined);
  };

  const deleteEntityClicked = (selectedEntity) => {
    //Logic will be added here for deletion of entity.
  };

  const changeMode = (event) => {
    console.log("changeMode", event);
    setMode(event.target.value);
  };

  const graphViewMainPanel =
    <div className={styles.graphViewContainer}>
      <div className={styles.graphHeader}>
        {filter}
        {headerButtons}
      </div>
      <div>
        {//Just a placeholder for actual graph view. Below code should be removed.
          // <ul>{props.entityTypes && props.entityTypes?.map((el) => <li data-testid={`${el.entityName}-entityNode`} key={el.entityName} style={{ color: "blue", cursor: "pointer" }} onClick={(e) => handleEntitySelection(el.entityName)}>{el.entityName}</li>)}
          // </ul>
          //--------------//
        }
      </div>
      <div>
        <Radio.Group options={["Off", "AddNode", "AddEdge"]} onChange={changeMode} value={mode} />
      </div>
      {/* <GraphVis entityTypes={props.entityTypes} mode={mode} /> */}
      <GraphVis 
        entityTypes={props.entityTypes}
        //entityTypes={mockEntities} 
        mode={mode} 
        handleEntitySelection={handleEntitySelection}
      />
    </div>;

  return (
    !viewSidePanel ? graphViewMainPanel :
      <SplitPane
        style={splitStyle}
        paneStyle={splitPaneStyles.pane}
        allowResize={true}
        resizerClassName={styles.resizerStyle}
        pane1Style={splitPaneStyles.pane1}
        pane2Style={splitPaneStyles.pane2}
        split="vertical"
        primary="first"
        defaultSize="70%"
      >
        {graphViewMainPanel}
        <GraphViewSidePanel
          entityTypes={props.entityTypes}
          onCloseSidePanel={onCloseSidePanel}
          deleteEntityClicked={deleteEntityClicked}
        />
      </SplitPane>
  );
};

export default GraphView;
