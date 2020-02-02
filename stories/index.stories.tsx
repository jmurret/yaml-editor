import * as React from "react";
import { storiesOf } from "@storybook/react";
import YamlEditor from "../src/YamlEditor";

const stories = storiesOf("Components", module);

stories.add("YamlEditor", () => <YamlEditor style={{ height: 200 }} />);
