import Blockly from "blockly"
import {
  ObservableProcedureModel,
  ObservableParameterModel,
  isProcedureBlock
} from '@blockly/block-shareable-procedures';

export function functions() {
  Blockly.Blocks['my_procedure_def'] = {
    init: function () {
      const model = this.model = new ObservableProcedureModel(this.workspace, `${Date.now()}`);
      console.log(this)
      this.workspace.getProcedureMap().add(model);
      // debugger;

      this.appendDummyInput()
        .appendField("Draw Circle");
      this.appendValueInput("radius")
        .setCheck(null)
        .appendField("Radius");
      this.appendValueInput("x")
        .setCheck(null)
        .appendField("X axis");
      this.appendValueInput("y")
        .setCheck(null)
        .appendField("Y axis");
      this.setColour(150);
      this.setTooltip("");
      this.setHelpUrl("");
      // etc...
    },
    destroy: function() {
      // (Optionally) Destroy the model when the definition block is deleted.

      // Insertion markers reference the model of the original block.
      if (this.isInsertionMarker()) return;
      this.workpace.getProcedureMap().delete(model.getId());
    },
    getProcedureModel() {
      return this.model;
    },

    isProcedureDef() {
      return true;
    },

    getVarModels() {
      // If your procedure references variables
      // then you should return those models here.
      return [];
    },

    doProcedureUpdate: function() {
      debugger
      // this.setFieldValue('NAME', this.model.getName());
      // this.setFieldValue(
      //   'PARAMS',
      //   this.model.getParameters()
      //     .map((p) => p.getName())
      //     .join(','))
      // this.setFieldValue(
      //   'RETURN', this.model.getReturnTypes()?.join(','))
    },
    saveExtraState(doFullSerialization) {
      const state = Object.create(null);
      state['procedureId'] = this.model.getId();

      if (doFullSerialization) {
        state['name'] = this.model.getName();
        state['parameters'] = this.model.getParameters().map((p) => {
          return { name: p.getName(), id: p.getId() };
        });
        state['returnTypes'] = this.model.getReturnTypes();

        // Flag for deserialization.
        state['createNewModel'] = true;
      }

      return state;
    },

    loadExtraState(state) {
      const id = state['procedureId']
      const map = this.workspace.getProcedureMap();

      if (map.has(id) && !state['createNewModel']) {
        // Delete the existing model (created in init).
        map.delete(this.model.getId());
        // Grab a reference to the model we're supposed to reference.
        this.model = map.get(id);
        this.doProcedureUpdate();
        return;
      }

      // There is no existing procedure model (we are likely pasting), so
      // generate it from JSON.
      debugger
      this.model
        .setName(state['name'])

      debugger
      this.model
        .setReturnTypes(state['returnTypes']);
      // for (const [i, param] of state['parameters'].entries()) {
      //   this.model.insertParameter(
      //     i,
      //     new ObservableParameterModel(
      //       this.workspace, param['name'], param['id']));
      // }

      debugger
      this.doProcedureUpdate();
    },
  };

  Blockly.Blocks['my_procedure_call'] = {
    init: function () {
      const model = this.model = new ObservableProcedureModel(this.workspace, `${Date.now()}`);
      console.log(this)
      this.workspace.getProcedureMap().add(model);
      // debugger;

      this.appendDummyInput()
        .appendField("Draw Circle");
      this.appendValueInput("radius")
        .setCheck(null)
        .appendField("Radius");
      this.appendValueInput("x")
        .setCheck(null)
        .appendField("X axis");
      this.appendValueInput("y")
        .setCheck(null)
        .appendField("Y axis");
      this.setColour(150);
      this.setTooltip("");
      this.setHelpUrl("");
      // etc...
    },
    doProcedureUpdate(x) {
      console.log(x)
      console.log(this)
      debugger  
      this.setFieldValue('radius', "y");
      // this.setFieldValue(
      //   'PARAMS',
      //   this.model.getParameters()
      //     .map((p) => p.getName())
      //     .join(','))
      // this.setFieldValue(
      //   'RETURN', this.model.getReturnTypes().join(','))
    },

    getProcedureModel() {
      return this.model;
    },

    isProcedureDef() {
      return false;
    },

    getVarModels() {
      // If your procedure references variables
      // then you should return those models here.
      return [];
    },

    saveExtraState(x) {
      console.log(x)
      debugger
      return {
        'procedureId': this.model?.getId(),
      };
    },

    loadExtraState(state) {
      const id = state['procedureId']
      const map = this.workspace.getProcedureMap();

      if (map.has(id) && !state['createNewModel']) {
        // Delete the existing model (created in init).
        map.delete(this.model.getId());
        // Grab a reference to the model we're supposed to reference.
        this.model = map.get(id);
        this.doProcedureUpdate();
        return;
      }

      // There is no existing procedure model (we are likely pasting), so
      // generate it from JSON.
      debugger
      this.model
        .setName(state['name'])
    },

    // Handle pasting after the procedure definition has been deleted.
    onchange(event) {
      if (event.type === Blockly.Events.BLOCK_CREATE &&
        event.blockId === this.id) {
        if (!this.model) { // Our procedure definition doesn't exist =(
          this.dispose();
        }
      }
    }
  };
}
