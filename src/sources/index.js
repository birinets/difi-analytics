import networks from "./networks";
import protocols from "./protocols";

export default class SourceManager {
  async load() {
    networks.forEach(async (net) => {
      const t = protocols.filter((p) =>
        p.networks.some((pn) => pn.name === net.name)
      );
      for (let d of t) {
        console.log(
          await d.getData(net, "0x44B79105495F476516B877CE678ad46369aFB1bb")
        );
      }
    });
  }
}
