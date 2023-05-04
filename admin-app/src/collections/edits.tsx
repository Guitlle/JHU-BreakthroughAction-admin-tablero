import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import SendIcon from '@mui/icons-material/Send';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import {
    buildCollection,
    buildProperty,
    EntityReference,
    PropertyPreviewProps,
    EntityCustomView,
    FieldDescription,
    FieldProps,
    useDataSource
// @ts-ignore
} from "firecms";

import readCSV from "../utils/readcsv";
import { exportConfig } from "../firebaseConfig";
import { init, GSBatchUpdate, GSReadRange, GSAppendToRange } from "../utils/persistence.js";

type BKJHDatabaseRow = {
    Nombre: string;
    Autor: string;
    Fecha: Date;
    CSV: string;
    BorrarIDs: string[];
    Aprobado: Boolean;
    Integrado: Boolean;
}

function CustomCSVPreview({value, property, size}: PropertyPreviewProps<string>)
{
    var nrows = value? value.split("\n").length - 1 : 0;
    return (
        value ? <p>{nrows} nueva(s) fila(s), {}</p> : <p></p>
    );
}


function CustomBorrarIDsPreview({value, property, size}: PropertyPreviewProps<string>)
{
    var nrows = value? value.split("\n").length : 0;
    return (
        value ? <p>Borrar {nrows} fila(s)</p> : <p></p>
    );
}

function CustomCSVField({
    property,
    value,
    setValue,
    setFieldValue, // use this function to update a different field
    customProps,
    touched,
    error,
    isSubmitting,
    context
}: FieldProps){
    function onChange(ev) {
        const fileReader = new FileReader();
        fileReader.readAsText(ev.target.files[0]);
        fileReader.onload = (readEv) => {
            setValue(fileReader.result);
        };
    }
    const uploadInputRef = React.useRef(null);

    return (
    <Button variant="contained" component="label">
        Subir Archivo CSV
        <input hidden accept="*" type="file" ref={uploadInputRef} onChange={onChange} />
    </Button>
    );
}

function DataPreview({entity, modifiedValues})
{
  if (!entity || !entity.values.CSV) return <>...</>
  var data = readCSV(entity.values.CSV);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  var columns = data[0];
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{}}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column, colkey) => (
                <TableCell
                  key={colkey}
                  align="left"
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(1 + page * rowsPerPage, 1 + page * rowsPerPage + rowsPerPage)
              .map((row, colkey) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={colkey}>
                    {row.map((cell, cellkey) => {
                      return (
                        <TableCell key={cellkey} align="left">
                            {cell}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[50, 100, 200]}
        component="div"
        count={data.length-1}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

const SchemaView: EntityCustomView = {
    path: "schemaview",
    name: "Datos Nuevos",
    Builder: ({collection, entity, modifiedValues}) => (
        <DataPreview entity={entity} modifiedValues={modifiedValues} />
    )
};

var initialized = false;
var MAXCOLS = 26;

function ApprovePreview({entity, modifiedValues})
{
  var datasource = useDataSource();
  if (!entity) return <>...</>
  async function approve () {
    if (!initialized) {
      await init(exportConfig.private_key, exportConfig.client_email);
      initialized = true;
    }
    var gsIdsResult = await GSReadRange(exportConfig.spreadsheetId, exportConfig.spreadsheetSheetName+"!A1:A20000");
    var gs_ids= gsIdsResult.result.values.map((item) => item[0]);
    if (entity.values.CSV) {
      var data = readCSV(entity.values.CSV);
      if (data.length > 1) {
        var gs_cols = await GSReadRange(exportConfig.spreadsheetId, exportConfig.spreadsheetSheetName+"!A1:Z1");
        var cols_ok = gs_cols.result.values.map((col, colix)=>col == data[0][colix] ).reduce((agg, value)=> (agg && value), true);
        var error = false;
        if (!cols_ok) {
          error = "Error: Las columnas del CSV no coinciden con las columnas de la base de datos";
        }
        if (data[0][0] != "ID") {
          error = "Error: la primera columna debe ser \"ID\"";
        }
        var last_row_ix = gs_ids.length;
        var last_id_value = parseInt(last_row_ix > 1 ? gs_ids[last_row_ix-1] : 0);
        if (!last_id_value)
          last_id_value = last_row_ix;
        for(var i=1; i<data.length; i++) {
          data[i][0] = last_id_value+i;
        }
        data.splice(0,1);
        let appendResult = await GSAppendToRange(
            exportConfig.spreadsheetId,
            exportConfig.spreadsheetSheetName+`!A${last_row_ix}:Z${last_row_ix}`,
            data
        );
        console.log(appendResult);
      }
    }
    if (entity.values.BorrarIDs && entity.values.BorrarIDs.length) {
      var del_ids = entity.values.BorrarIDs.split("\n");
      var emptyRow = [null];
      for (var i=0; i<MAXCOLS;i++)
        emptyRow.push("");
      var updateData = del_ids.map((entityId) => {
        let rangeRow = gs_ids.indexOf(entityId)+1;
        if (rangeRow == 0)
          return null;
        let row = emptyRow.slice();
        row[0] = entityId;
        return {
          range: `${exportConfig.spreadsheetSheetName}!A${rangeRow}`,
          values: [row]
        };
      }).filter((value) => value !== null);
      if (updateData.length > 0) {
        var updateResult = await GSBatchUpdate(exportConfig.spreadsheetId, `${exportConfig.spreadsheetSheetName}!A1:Z1`, updateData);
        console.log(updateResult);
      }
    }
    entity.values.Aprobado = true;
    datasource.saveEntity({path: entity.path, entityId: entity.id, values: entity.values, collection: editsCollection});
  }

  return (
    <Paper>
        {entity.values.Aprobado? (
          <Box sx={{p: 4}}>
            <h4>Este cambio ya fue aprobado e integrado en la base de datos.</h4>
            <Button variant="contained" endIcon={<SendIcon />} disabled>
              Continuar
            </Button>
          </Box>
        ):(
          <Box sx={{p: 4}}>
            <h4>Aprobar e integrar cambios en la base de datos:</h4>
            <Button variant="contained" endIcon={<SendIcon />} onClick={approve}>
              Continuar
            </Button>
          </Box>
        )}

    </Paper>
  );
}

const ApproveView: EntityCustomView = {
    path: "approve",
    name: "Aprobar",
    Builder: ({collection, entity, modifiedValues}) => (
        <ApprovePreview entity={entity} modifiedValues={modifiedValues} />
    )
};

const editsCollection = buildCollection<BKJHDatabaseRow>({
    name: "Database Edits",
    icon: "Grading",
    singularName: "Edit",
    path: "dbedits",
    views: [
        SchemaView,
        ApproveView
    ],
    permissions: ({
                      entity,
                      path,
                      user,
                      authController,
                      context
                  }: {
                    entity: any,
                    path: any,
                    user: any,
                    authController: any,
                    context: any
                  }) => {
        const isAdmin = authController.extra?.roles.includes("admin");
        const isEditor = authController.extra?.roles.includes("editor");
        return ({
            edit: isAdmin,
            create: isAdmin || isEditor,
            delete: isAdmin
        });
    },
    inlineEditing: false,
    properties: {
        Nombre: {
            name: "Nombre de edición de la base de datos",
            validation: { required: true },
            dataType: "string"
        },
        Autor: {
            name: "Email del autor",
            dataType: "string"
        },
        Fecha: {
            name: "Fecha",
            validation: { required: true },
            dataType: "date",
            mode: "date"
        },
        CSV: buildProperty({
            name: "Datos (CSV)",
            multiline: true,
            dataType: "string",
            Preview: CustomCSVPreview,
            Field: CustomCSVField
        }),
        BorrarIDs: {
            name: "IDs de filas para borrar (uno por línea)",
            multiline: true,
            dataType: "string",
            Preview: CustomBorrarIDsPreview
        },
        Aprobado: {
            dataType: "boolean",
            name: "Edición Aprobada",
            readOnly: true
        }
    }
});

export default editsCollection;
