import {
    buildCollection,
    buildProperty,
    EntityReference,
    PropertyPreviewProps
// @ts-ignore
} from "firecms";


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
        value ? <p>{nrows} nuevas filas</p> : <p>Empty CSV</p>
    );
}

const editsCollection = buildCollection<BKJHDatabaseRow>({
    name: "Database Edits",
    icon: "Grading",
    singularName: "Edit",
    path: "dbedits",
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
            name: "CSV",
            multiline: true,
            dataType: "string",
            Preview: CustomCSVPreview
        }),
        BorrarIDs: {
            name: "IDs de filas para borrar (uno por línea)",
            multiline: true,
            dataType: "string",
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
