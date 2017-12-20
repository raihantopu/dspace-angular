import {FieldParser} from './field-parser';
import {FormFieldModel} from '../models/form-field.model';
import {FormFieldMetadataValueObject} from '../models/form-field-metadata-value.model';
import {ClsConfig, DynamicFormGroupModel, DynamicInputModel, DynamicInputModelConfig} from '@ng-dynamic-forms/core';
import {
  DynamicSeriesAndNameModel, NAME_GROUP_SUFFIX, NAME_INPUT_1_SUFFIX, NAME_INPUT_2_SUFFIX, SERIES_GROUP_SUFFIX,
  SERIES_INPUT_1_SUFFIX,
  SERIES_INPUT_2_SUFFIX
} from '../ds-dynamic-form-ui/models/ds-dynamic-series-name.model';
import { isNotEmpty } from '../../../empty.util';

export class SeriesAndNameFieldParser extends FieldParser {
  private groupSuffix;
  private input1suffix;
  private input2suffix;

  constructor(protected configData: FormFieldModel, protected initFormValues, private type: string) {
    super(configData, initFormValues);

    if (type === 'series') {
      this.groupSuffix = SERIES_GROUP_SUFFIX;
      this.input1suffix = SERIES_INPUT_1_SUFFIX;
      this.input2suffix = SERIES_INPUT_2_SUFFIX;
    } else {
      // Name
      this.groupSuffix = NAME_GROUP_SUFFIX;
      this.input1suffix = NAME_INPUT_1_SUFFIX;
      this.input2suffix = NAME_INPUT_2_SUFFIX;
    }
  }

  public modelFactory(fieldValue: FormFieldMetadataValueObject): any {

    let clsGroup: ClsConfig;
    let clsInput: ClsConfig;
    const newId = this.configData.selectableMetadata[0].metadata
      .split('.')
      .slice(0, this.configData.selectableMetadata[0].metadata.split('.').length - 1)
      .join('.');

    clsInput = {
      grid: {
        host: 'col-sm-6'
      }
    };

    const inputGroup: DynamicFormGroupModel = Object.create(null);
    inputGroup.id = newId.replace(/\./g, '_') + this.groupSuffix;
    inputGroup.group = [];

    const input1ModelConfig: DynamicInputModelConfig = this.initModel(newId + this.input1suffix, true, false);
    const input2ModelConfig: DynamicInputModelConfig = this.initModel(newId + this.input2suffix, true, true);

    // values
    if (isNotEmpty(fieldValue)) {
      let values;
      if (this.type === 'series') {
        values = fieldValue.value.split(';');
      } else {
        values = fieldValue.value.split(',');
      }

      if (values.length > 1) {
        input1ModelConfig.value = values[0];
        input2ModelConfig.value = values[1];
      }
    }

    const model1 = new DynamicInputModel(input1ModelConfig, clsInput);
    const model2 = new DynamicInputModel(input2ModelConfig, clsInput);
    model1.name = this.getFieldId()[0];
    model2.name = this.getFieldId()[0];
    const placeholder = model1.placeholder.split('/');
    if (placeholder.length === 2) {
      model1.placeholder = placeholder[0];
      model2.placeholder = placeholder[1];
    }
    inputGroup.group.push(model1);
    inputGroup.group.push(model2);

    clsGroup = {
      element: {
        control: 'form-row',
      }
    };
    return new DynamicSeriesAndNameModel(inputGroup, clsGroup);
  }

}
