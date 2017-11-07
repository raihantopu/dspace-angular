import {
  ClsConfig,
  DynamicFormGroupModel,
  DynamicInputModel,
  DynamicInputModelConfig,
  DynamicSelectModel,
  DynamicSelectModelConfig
} from '@ng-dynamic-forms/core';

import { FieldParser } from './field-parser';
import { deleteProperty } from '../../../object.util';
import { DynamicTypeaheadModel, DynamicTypeaheadModelConfig } from '../ds-dynamic-form-ui/models/typeahead/dynamic-typeahead.model';
import { FormFieldModel } from '../models/form-field.model';
import { AuthorityOptions } from '../models/authority-options.model';
import { Observable } from 'rxjs/Observable';
import { SubmissionFormsConfigService } from '../../../../core/config/submission-forms-config.service';
import { hasValue } from '../../../empty.util';
import { PageInfo } from '../../../../core/shared/page-info.model';

export class OneboxFieldParser extends FieldParser {

  constructor(protected configData: FormFieldModel,
              protected authorityUuid: string,
              protected formsConfigService: SubmissionFormsConfigService) {
    super(configData);
  }

  public parse(): any {
    let cls: ClsConfig;

    if (this.configData.selectableMetadata.length > 1) {
      const newId = this.configData.selectableMetadata[0].metadata
        .split('.')
        .slice(0, this.configData.selectableMetadata[0].metadata.split('.').length - 1)
        .join('.');

      const inputSelectGroup: DynamicFormGroupModel = Object.create(null);
      inputSelectGroup.id = newId.replace(/\./g, '_') + '_group';
      inputSelectGroup.group = [];
      inputSelectGroup.legend = this.configData.label;

      const selectModelConfig: DynamicSelectModelConfig<any> = this.initModel(  newId + '.metadata');
      cls = {
        element: {
          control: 'input-group-addon ds-form-input-addon',
        },
        grid: {
          host: 'col-sm-4 pr-0'
        }
      };
      inputSelectGroup.group.push(new DynamicSelectModel(selectModelConfig, cls));

      this.configData = deleteProperty(this.configData, 'selectableMetadata') as FormFieldModel;
      const inputModelConfig: DynamicInputModelConfig = this.initModel(newId + '.value', true, true);
      cls = {
        element: {
          control: 'ds-form-input-value',
        },
        grid: {
          host: 'col-sm-8 pl-0'
        }
      };

      inputSelectGroup.group.push(new DynamicInputModel(inputModelConfig, cls));
      cls = {
        element: {
          control: 'form-row',
        }
      };
      return new DynamicFormGroupModel(inputSelectGroup, cls);
    } else if (this.configData.selectableMetadata[0].authority) {
      const typeaheadModelConfig: DynamicTypeaheadModelConfig = this.initModel();
      typeaheadModelConfig.search = this.getSearchFn(
        this.getAuthorityOptionsObj(
          this.authorityUuid,
          this.configData.selectableMetadata[0].authority,
          this.configData.selectableMetadata[0].metadata));
      typeaheadModelConfig.value = '';
      typeaheadModelConfig.minChars = 3;
      return new DynamicTypeaheadModel(typeaheadModelConfig);
    } else {
      const inputModelConfig: DynamicInputModelConfig = this.initModel();
      return new DynamicInputModel(inputModelConfig);
    }
  }

  // @TODO To refactor when service for retrieving authority will be available
  protected getAuthority(authorityOptions: AuthorityOptions, pageInfo?: PageInfo): Observable<any[]> {
    const queryPage = (hasValue(pageInfo)) ? `&page=${pageInfo.currentPage - 1}&size=${pageInfo.elementsPerPage}` : '';
    const href = `https://dspace7.dev01.4science.it/dspace-spring-rest/api/integration/authorities/${authorityOptions.name}/entries?query=${authorityOptions.query}&metadata=${authorityOptions.metadata}&uuid=${authorityOptions.uuid}${queryPage}`
    return this.formsConfigService.getConfigByHref(href)
  }

  protected getSearchFn(authorityOptions: AuthorityOptions) {
    return (query: string): Observable<any> => {
      authorityOptions.query = query;
      return this.getAuthority(authorityOptions);
    };
  }
}
