declare module "family-chart" {
  interface FamilyChartData {
    id: string;
    data: any;
    rels: {
      father?: string;
      mother?: string;
      spouses?: string[];
      children?: string[];
    };
  }

  interface TreeCalculationOptions {
    data: FamilyChartData[];
    node_separation: number;
    level_separation: number;
    main_id: string;
  }

  interface TreeData {
    data: any[];
  }

  interface FamilyChart {
    createSvg(container: HTMLElement): SVGSVGElement;
    CalculateTree(options: TreeCalculationOptions): TreeData;
    view(
      treeData: TreeData,
      svg: SVGSVGElement,
      cardFunction: (onClick: (d: any) => void) => any
    ): void;
  }

  const familyChart: FamilyChart;
  export default familyChart;
}
