(function (root) {
  "use strict";
  const factory = root.MCLSemanticBankFactory;
  if (!factory || root.MCLQuestionTemplates?.getTool("triangle-congruence")) return;
  const concepts = ["criteria-correspondence", "direct-givens", "angle-facts", "hypotenuse-leg", "proof-validation-completion"];
  const choices = ["SSS", "SAS", "ASA", "AAS", "HL", "AAA", "SSA"];
  const plans = {
    "criteria-correspondence": { direct:["direct-sss","SSS"], inverse:["direct-sas","SAS"], interpret:["direct-asa","ASA"], translate:["direct-aas","AAS"], diagnose:["right-triangle-hl","HL"] },
    "direct-givens": { direct:["direct-sss","SSS"], inverse:["shared-side-sss","SSS"], interpret:["direct-sas","SAS"], translate:["direct-asa","ASA"], diagnose:["direct-aas","AAS"] },
    "angle-facts": { direct:["vertical-sas","SAS"], inverse:["parallel-asa","ASA"], interpret:["midpoint-sas","SAS"], translate:["parallel-asa","ASA"], diagnose:["vertical-sas","SAS"] },
    "hypotenuse-leg": { direct:["right-triangle-hl","HL"], inverse:["right-triangle-hl","HL"], interpret:["right-triangle-hl","HL"], translate:["right-triangle-hl","HL"], diagnose:["right-triangle-hl","HL"] },
    "proof-validation-completion": { direct:["shared-side-sss","SSS"], inverse:["vertical-sas","SAS"], interpret:["parallel-asa","ASA"], translate:["midpoint-sas","SAS"], diagnose:["right-triangle-hl","HL"] }
  };
  const en = {
    "criteria-correspondence": {
      direct:"Select the criterion justified by three corresponding sides.", inverse:"Use the correspondence to identify the included angle.",
      interpret:"Interpret two angle pairs and the included side.", translate:"Translate the markings into a valid AAS proof.",
      diagnose:"Reject angle-only evidence and use the right-triangle data."
    },
    "direct-givens": {
      direct:"Organize three side givens into a proof.", inverse:"Identify the shared side needed to complete SSS.",
      interpret:"Match two sides and their included angle.", translate:"Translate direct ASA givens into proof rows.",
      diagnose:"Correct the correspondence order before applying AAS."
    },
    "angle-facts": {
      direct:"Derive the included angles from vertical angles.", inverse:"Use parallel lines to recover two angle congruences.",
      interpret:"Interpret midpoint and perpendicular facts as SAS data.", translate:"Translate alternate interior angles into an ASA proof.",
      diagnose:"Find the missing derived angle fact."
    },
    "hypotenuse-leg": {
      direct:"Verify the right triangles, hypotenuses, and a leg for HL.", inverse:"Determine which leg fact completes HL.",
      interpret:"Interpret perpendicular markings before invoking HL.", translate:"Translate a shared-leg diagram into HL.",
      diagnose:"Reject an invalid SAS shortcut and complete the proof with HL."
    },
    "proof-validation-completion": {
      direct:"Complete every statement and reason in the proof.", inverse:"Work backward from the target to a supporting fact.",
      interpret:"Check whether the proof order respects dependencies.", translate:"Convert the diagram and givens into a formal proof table.",
      diagnose:"Locate and repair the invalid theorem or reason."
    }
  };
  const zh = {
    "criteria-correspondence": {
      direct:"根据三组对应边选择全等判据。", inverse:"利用对应关系识别夹角。", interpret:"解释两组角与夹边的关系。",
      translate:"把图形标记转化为有效的 AAS 证明。", diagnose:"排除只有角的条件，并使用直角三角形数据。"
    },
    "direct-givens": {
      direct:"把三组边条件组织成证明。", inverse:"找出完成 SSS 所需的公共边。", interpret:"正确匹配两边及其夹角。",
      translate:"把直接的 ASA 条件写成证明步骤。", diagnose:"修正对应顺序后应用 AAS。"
    },
    "angle-facts": {
      direct:"利用对顶角推出夹角相等。", inverse:"利用平行线推出两组角相等。", interpret:"把中点与垂直条件解释为 SAS 数据。",
      translate:"把内错角关系转化为 ASA 证明。", diagnose:"找出证明中遗漏的推导角关系。"
    },
    "hypotenuse-leg": {
      direct:"核对直角三角形、斜边和一条直角边以使用 HL。", inverse:"判断哪条直角边条件能完成 HL。",
      interpret:"先解释垂直标记，再使用 HL。", translate:"把公共直角边图形转化为 HL 证明。",
      diagnose:"排除无效的 SAS 捷径，并用 HL 完成证明。"
    },
    "proof-validation-completion": {
      direct:"选择每一步结论和理由，完成证明。", inverse:"从目标倒推所缺的支持条件。", interpret:"检查证明顺序是否符合依赖关系。",
      translate:"把图形与已知条件转化为正式证明表。", diagnose:"找出并修复错误的判据或理由。"
    }
  };
  factory.register({
    toolId:"triangle-congruence", course:"geometry-1", concepts, integerBounds:[0,720],
    build(context) {
      const [proofKind,theorem] = plans[context.conceptId][context.taskForm];
      const isZh=context.lang==="zh", main=(isZh?zh:en)[context.conceptId][context.taskForm];
      return {
        main, plain:main, prompt:isZh?"根据图形和已知条件完成证明。":"Complete the proof from the diagram and givens.",
        answer:theorem, distractors:choices.filter(item=>item!==theorem),
        lines:[{line:isZh?"整理已知与图形标记":"Organize givens and diagram marks",note:isZh?"建立对应关系":"establish correspondence"},{line:theorem,note:isZh?"使用有效全等判据":"apply the valid theorem"}],
        parameters:{proofKind,theorem,focus:context.taskForm,geometrySchemaId:`triangle-proof-${context.template.id}`,proofScenarioIndex:context.template.id}, audit:{proofKind,theorem,focusPrompt:main,geometrySchemaId:`triangle-proof-${context.template.id}`}
      };
    }
  });
})(typeof window!=="undefined"?window:globalThis);
