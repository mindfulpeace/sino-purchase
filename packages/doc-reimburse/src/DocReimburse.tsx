import { amountToWord } from "@sino-purchase/doc-utils"
import type { DocReimburseProps } from "./types"

const trItem = (id: number, detail?: string, amount?: number) => (
  <tr key={id}>
    <td style={{ textAlign: "center" }}>{id}</td>
    <td>{detail || ""}</td>
    <td>{" "}</td>
    <td>{" "}</td>
    <td>{" "}</td>
    <td style={{ textAlign: "right" }}>{!amount ? "" : (amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
  </tr>
)

const trSign = (zh: string, en: string, name: string, y?: string, m?: string, d?: string) => (
  <tr>
    <td style={{ borderRight: "none", padding: "0 0.5em", height: "4em", textAlign: "center" }}>
      {zh}<br />{en}
    </td>
    <td style={{ borderRight: "none" }}>{name}</td>
    <td id="sign-date" colSpan={2} style={{ borderLeft: "none", verticalAlign: "bottom", textAlign: "right", paddingBottom: 0 }}>
      日期：
      <span style={{ width: "5ch", display: "inline-block", textAlign: "center" }}>{y || ""}</span>年
      <span style={{ width: "3ch", display: "inline-block", textAlign: "center" }}>{m?.padStart(2, "0")}</span>月
      <span style={{ width: "3ch", display: "inline-block", textAlign: "center" }}>{d?.padStart(2, "0")}</span> 日
    </td>
  </tr>
)

const DocReimburse = ({ date, items, applicant = "任金涛", companyName = "中矿新元矿业有限公司", companyNameEn = "Sino Xinyuan Mining company Limited" }: DocReimburseProps) => {
  const total = items?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0
  const [y, m, d] = date?.split("-") || []

  return (
    <div className="doc-reimburse" style={{ color: "#000" }}>
      <h1 style={{ fontSize: 20 }}>
        {companyName}<br />
        {companyNameEn}
      </h1>
      <h2 style={{ fontSize: 16 }}>费用报销单 Reimbursement Form</h2>

      <span id="att" style={{ float: "right", height: 0, marginTop: "-1.4em" }}>
        附件：&nbsp;&nbsp;&nbsp;&nbsp; 张
      </span>

      <table id="user-info">
        <tbody>
          <tr>
            <td width="20%">部门 Department:</td>
            <td width="24%" style={{ borderRight: 0 }}>采购部</td>
            <td style={{ borderLeft: 0 }}></td>
            <td width="17%">日期 Date:</td>
            <td width="17%">{date}</td>
          </tr>
          <tr>
            <td rowSpan={3} style={{ textAlign: "center" }}>
              收款人账户信息<br />
              Payee Account
            </td>
            <td>账户名称 Name</td>
            <td colSpan={3}>{applicant}</td>
          </tr>
          <tr>
            <td>开户银行 Bank</td>
            <td colSpan={3}></td>
          </tr>
          <tr>
            <td>银行账号 Account No</td>
            <td colSpan={3}></td>
          </tr>
        </tbody>
      </table>

      <table id="payment-method">
        <tbody>
          <tr>
            <td width="30%" style={{ textAlign: "center" }}>
              付款方式<br />
              Payment Method
            </td>
            <td>
              <span>□转账Transfer</span>
              <span>□现金支票Casher's check</span>
              <span>□现金Cash</span>
              <span>□销备用金</span>
            </td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr style={{ textAlign: "center" }}>
            <td width="5%" style={{ padding: 4 }}>
              序号<br />S/N
            </td>
            <td width="41%">
              费用报销明细<br />
              Expense Reimbursement Details
            </td>
            <td width="14%">型号<br />Specifications</td>
            <td width="14%">数量<br />Quantity</td>
            <td>单价<br />Price</td>
            <td width="17%">
              金额<br />Amount
            </td>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item, id) => trItem(id + 1, item.detail, item.amount))}
          {items && Array.from({ length: Math.max(0, 8 - items.length) }, (_, i) => trItem((items?.length || 0) + i + 1))}
        </tbody>
      </table>

      <table>
        <tbody>
          <tr>
            <td width="20%" style={{ textAlign: "center" }}>
              合计 Total<br />Amount(K/$/￥)
            </td>
            <td id="total">{total.toFixed(2)}</td>
            <td width="9%">汇率：</td>
            <td width="20%"></td>
          </tr>
          <tr style={{ textAlign: "center" }}>
            <td>
              金额(大写)<br />
              Amount(K/$/￥)
            </td>
            <td colSpan={3}>
              <span style={{ letterSpacing: "1ch" }}>{amountToWord(total)}</span>
            </td>
          </tr>

          {trSign("申请人", "Requestor", applicant, y, m, d)}
          {trSign("部门负责人", "Manager", "")}
          {trSign("分管领导", "Duty General Manager Approval", "")}
          {trSign("财务", "Financial", "")}
          {trSign("总经理", "General Manager Approval", "")}
          {trSign("董事长", "Chairman Approval", "")}
        </tbody>
      </table>
    </div>
  )
}

export default DocReimburse
