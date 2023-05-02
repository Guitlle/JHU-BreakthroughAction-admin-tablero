import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
    FieldProps
// @ts-ignore
} from "firecms";

import readCSV from "../utils/readcsv";


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

const schemaView: EntityCustomView = {
    path: "schemaview",
    name: "Data preview",
    Builder: ({collection, entity, modifiedValues}) => (
        <DataPreview entity={entity} modifiedValues={modifiedValues} />
    )
};

const editsCollection = buildCollection<BKJHDatabaseRow>({
    name: "Database Edits",
    icon: "Grading",
    singularName: "Edit",
    path: "dbedits",
    views: [
        schemaView
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
            validation: { required: true },
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
            readOnly: false
        },
        Integrado: {
            dataType: "boolean",
            name: "Edición Integrada",
            readOnly: true
        }
    }
});

export default editsCollection;
