from marshmallow import Schema


class BasicSchema(Schema):
    def on_bind_field(self, field_name, field_obj):
        from app.serde import camelcase

        field_obj.data_key = camelcase(field_obj.data_key or field_name)
