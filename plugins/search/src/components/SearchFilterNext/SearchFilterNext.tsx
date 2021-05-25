/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { ReactElement, useEffect } from 'react';
import {
  makeStyles,
  FormControl,
  FormControlLabel,
  InputLabel,
  Checkbox,
  Select,
  MenuItem,
  FormLabel,
} from '@material-ui/core';

import { useSearch } from '../SearchContext';

const useStyles = makeStyles({
  select: {
    width: '100%',
  },
  subtitle: {
    textTransform: 'capitalize',
  },
});

export type Component = Omit<Props, 'component' | 'debug'>;

export type Props = {
  component: (props: Component) => ReactElement;
  debug?: boolean;
  name: string;
  values?: string[];
  defaultValue?: string | null;
};

/**
 * @param defaultValue - The default value. If more than one value should be defaulted to "checked," pass a comma-separated string.
 */
const CheckboxFilter = ({ name, defaultValue, values }: Component) => {
  const { filters, setFilters } = useSearch();

  const setCheckboxFilter = (filter: string) => {
    const newFilters = filters;
    const currentValues = newFilters[name] as string[];

    if (!filter) return;

    if (!currentValues) {
      setFilters({ ...filters, [name]: [filter] });
    } else if (!currentValues?.includes(filter)) {
      setFilters({
        ...filters,
        [name]: [...currentValues, filter],
      });
    } else {
      const filterToDelete = currentValues.find(value => value === filter);
      if (filterToDelete) {
        currentValues.splice(currentValues.indexOf(filterToDelete), 1);

        setFilters({ ...filters, [name]: currentValues });
      }
    }
  };

  useEffect(() => {
    if (defaultValue) {
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: defaultValue.split(','),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, setFilters]);

  return (
    <FormControl>
      <FormLabel>{name}</FormLabel>
      {values &&
        values.map((v: string) => (
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                tabIndex={-1}
                inputProps={{ 'aria-labelledby': v }}
                value={v}
                name={v}
                onChange={() => setCheckboxFilter(v)}
                checked={
                  filters[name]
                    ? (filters[name] as string[]).includes(v)
                    : false
                }
              />
            }
            label={v}
          />
        ))}
    </FormControl>
  );
};

const SelectFilter = ({ name, defaultValue, values }: Component) => {
  const classes = useStyles();
  const { filters, setFilters } = useSearch();

  const setSelectFilter = (filter: string) => {
    const newFilters = filters;
    if (newFilters[name] && filter === '') {
      delete newFilters[name];
      setFilters({ newFilters });
    } else {
      setFilters({ ...filters, [name]: filter as string });
    }
  };

  useEffect(
    () => {
      if (defaultValue) {
        setFilters(prevFilters => ({
          ...prevFilters,
          [name]: defaultValue,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setFilters, defaultValue],
  );

  return (
    <FormControl variant="filled" className={classes.select}>
      <InputLabel margin="dense">{name}</InputLabel>
      <Select
        variant="outlined"
        value={filters[name] || ''}
        onChange={(e: React.ChangeEvent<any>) =>
          setSelectFilter(e?.target?.value)
        }
      >
        <MenuItem value="">
          <em>All</em>
        </MenuItem>
        {values &&
          values.map((value: string) => (
            <MenuItem value={value}>{value}</MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

const SearchFilterNext = ({ component: Element, ...props }: Props) => {
  return <Element {...props} />;
};

SearchFilterNext.Checkbox = (props: Omit<Props, 'component'>) => (
  <SearchFilterNext {...props} component={CheckboxFilter} />
);
SearchFilterNext.Select = (props: Omit<Props, 'component'>) => (
  <SearchFilterNext {...props} component={SelectFilter} />
);

export { SearchFilterNext };