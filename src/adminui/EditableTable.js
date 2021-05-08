import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Typography,
  notification,
  Spin,
  Button,
} from "antd";
import axios from "../util/Api";
import { EditOutlined, DeleteTwoTone } from "@ant-design/icons";
import { GET_DATA_URL } from "../constants";
const { Search } = Input;

const originData = [];

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = () => {
  const [form] = Form.useForm();
  let [data, setData] = useState(originData);
  const [editingKey, setEditingKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedData, setSelectedData] = useState([]);
  const openNotificationWithIcon = (type, message) => {
    notification[type]({
      message: message,
    });
  };
  data =
    data &&
    data.filter((item) => {
      return Object.keys(item).some((key) =>
        item[key].toLowerCase().includes(filter)
      );
    });
  const removeId = (id) => {
    data = data.filter((item) => {
      return item.id !== id;
    });
    setData(data);
  };
  const removeSelected = () => {
    const idArray = selectedData.map((e) => e.id);
    data = data.filter((item) => {
      return !idArray.includes(item.id);
    });
    setData(data);
    setSelectedData([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let { data: dataList } = await axios.get(GET_DATA_URL);
        dataList = dataList.map((item) => {
          var temp = Object.assign({}, item);
          temp.key = item.id;
          return temp;
        });
        setData(dataList);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
        openNotificationWithIcon("error", e.message);
      }
    };
    fetchData();
  }, []);
  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      age: "",
      address: "",
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "50%",
      editable: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "50%",
      editable: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      width: "50%",
      editable: true,
    },
    {
      title: "operation",
      dataIndex: "operation",
      className: "operation",
      width: "50%",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <>
            {editable ? (
              <span>
                <a
                  href="/#"
                  onClick={() => save(record.key)}
                  style={{
                    marginRight: 8,
                  }}
                >
                  Save
                </a>
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <a href="/#">Cancel</a>
                </Popconfirm>
              </span>
            ) : (
              <Typography.Link
                disabled={editingKey !== ""}
                onClick={() => edit(record)}
              >
                <EditOutlined />
              </Typography.Link>
            )}
            <div className="delete-btn">
              <Typography.Link
                disabled={editingKey !== ""}
                onClick={() => removeId(record.id)}
              >
                <DeleteTwoTone twoToneColor="#eb2f96" />
              </Typography.Link>
            </div>
          </>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      setSelectedData(selectedRows);
    },
  };

  const onSearchChange = (e) => {
    setFilter(e.target.value);
  };
  if (loading) {
    return <Spin />;
  }
  return (
    <>
      <Search
        placeholder="Search by name, email or role"
        onChange={onSearchChange}
        enterButton
      />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowSelection={{
            ...rowSelection,
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
      {selectedData.length > 0 && (
        <Button
          type="primary"
          danger
          className="delete-selected-btn"
          onClick={() => removeSelected()}
        >
          Delete Selected
        </Button>
      )}
    </>
  );
};

export default EditableTable;
